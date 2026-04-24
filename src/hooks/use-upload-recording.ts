import { useCallback } from "react";
import { Platform } from "react-native";
import { getInfoAsync } from "expo-file-system/legacy";

import { useAuthStore } from "@/stores/auth-store";
import { useMeetingStore } from "@/stores/meeting-store";
import { useRecordingsStore } from "@/stores/recordings-store";
import { toErrorMessage } from "@/utils/to-error-message";

function getContentTypeFromExt(uri: string): string {
  const ext = uri.split(".").pop()?.toLowerCase();
  if (ext === "m4a" || ext === "mp4") return "audio/mp4";
  if (ext === "3gp") return "audio/3gpp";
  if (ext === "webm") return "audio/webm";
  if (ext === "ogg") return "audio/ogg";
  return "audio/mp4";
}

async function resolveContentType(uri: string): Promise<string> {
  // On web, the blob's own `.type` is authoritative — it reflects what the
  // browser actually recorded, which varies by device (desktop → webm/opus,
  // iOS → mp4, some Android webviews → ogg). Assuming webm breaks S3 uploads
  // on those clients because the Content-Type header mismatches the bytes.
  if (Platform.OS === "web" && uri.startsWith("blob:")) {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      if (blob.type) {
        // Normalize: strip codecs parameter ("audio/webm;codecs=opus" → "audio/webm"),
        // S3 signed URLs expect the exact Content-Type used at signing time.
        return blob.type.split(";")[0].trim();
      }
    } catch {
      // fall through
    }
  }
  return getContentTypeFromExt(uri);
}

async function getFileSize(uri: string): Promise<number> {
  if (Platform.OS === "web") {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return blob.size;
    } catch {
      return 0;
    }
  }

  const info = await getInfoAsync(uri);
  if (!info.exists) return 0;
  return info.size ?? 0;
}

async function isSourceAvailable(uri: string): Promise<boolean> {
  if (Platform.OS === "web") {
    try {
      const response = await fetch(uri);
      if (!response.ok) return false;
      const blob = await response.blob();
      return blob.size > 0;
    } catch {
      return false;
    }
  }

  const info = await getInfoAsync(uri);
  return info.exists && (info.size ?? 0) > 0;
}

const LOST_SOURCE_ERROR_ES =
  "La grabación se perdió al recargar la página. Por favor, graba de nuevo.";

interface UploadParams {
  recordingId: string;
  uri: string;
  title: string;
  durationMs: number;
}

export function useUploadRecording(): {
  uploadRecording: (params: UploadParams) => Promise<void>;
  isUploading: boolean;
  uploadStage: string | null;
} {
  const uploadProgress = useMeetingStore((s) => s.uploadProgress);
  const isUploading =
    uploadProgress?.stage === "uploading" || uploadProgress?.stage === "processing";

  const uploadRecording = useCallback(
    async ({ recordingId, uri, title, durationMs }: UploadParams) => {
      const userId = useAuthStore.getState().user?.userId;
      if (!userId) return;

      const recordingsStore = useRecordingsStore.getState();

      // On web, a blob URL from a previous session is revoked after reload and
      // any retry would fail with ERR_FILE_NOT_FOUND. Detect that up front so
      // we don't create an orphan meeting on the backend for a file we can no
      // longer upload.
      const available = await isSourceAvailable(uri);
      if (!available) {
        await recordingsStore.updateRecordingStatus(recordingId, {
          uploadStatus: "failed",
          errorMessage: LOST_SOURCE_ERROR_ES,
        });
        return;
      }

      const contentType = await resolveContentType(uri);
      const ext =
        contentType === "audio/3gpp"
          ? "3gp"
          : contentType === "audio/webm"
            ? "webm"
            : contentType === "audio/ogg"
              ? "ogg"
              : "m4a";
      const fileName = `${title.replace(/\s+/g, "-").toLowerCase()}.${ext}`;
      const sizeBytes = await getFileSize(uri);
      const durationSeconds = durationMs / 1000;

      await recordingsStore.updateRecordingStatus(recordingId, { uploadStatus: "uploading" });

      try {
        await useMeetingStore
          .getState()
          .startMeetingUpload(
            userId,
            title,
            uri,
            fileName,
            contentType,
            sizeBytes,
            durationSeconds,
          );

        const finalStage = useMeetingStore.getState().uploadProgress?.stage;
        const meetingId = useMeetingStore.getState().uploadProgress?.meeting_id;
        await recordingsStore.updateRecordingStatus(recordingId, {
          uploadStatus: finalStage === "failed" ? "failed" : "processing",
          meetingId,
          errorMessage:
            finalStage === "failed" ? useMeetingStore.getState().uploadProgress?.error : undefined,
        });
      } catch (err) {
        await recordingsStore.updateRecordingStatus(recordingId, {
          uploadStatus: "failed",
          errorMessage: toErrorMessage(err),
        });
      }
    },
    [],
  );

  return {
    uploadRecording,
    isUploading: isUploading ?? false,
    uploadStage: uploadProgress?.stage ?? null,
  };
}
