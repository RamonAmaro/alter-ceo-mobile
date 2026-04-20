import { useCallback } from "react";
import { Platform } from "react-native";

import { useAuthStore } from "@/stores/auth-store";
import { useMeetingStore } from "@/stores/meeting-store";

function getContentType(uri: string): string {
  const ext = uri.split(".").pop()?.toLowerCase();
  if (ext === "m4a" || ext === "mp4") return "audio/mp4";
  if (ext === "3gp") return "audio/3gpp";
  if (ext === "webm") return "audio/webm";
  if (uri.startsWith("blob:")) return "audio/webm";
  return "audio/mp4";
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

  const { getInfoAsync } = await import("expo-file-system/legacy");
  const info = await getInfoAsync(uri);
  return info.exists ? (info.size ?? 0) : 0;
}

interface UploadParams {
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

  const uploadRecording = useCallback(async ({ uri, title, durationMs }: UploadParams) => {
    const userId = useAuthStore.getState().user?.userId;
    if (!userId) return;

    const contentType = getContentType(uri);
    const ext =
      contentType === "audio/3gpp" ? "3gp" : contentType === "audio/webm" ? "webm" : "m4a";
    const fileName = `${title.replace(/\s+/g, "-").toLowerCase()}.${ext}`;
    const sizeBytes = await getFileSize(uri);
    const durationSeconds = durationMs / 1000;

    await useMeetingStore
      .getState()
      .startMeetingUpload(userId, title, uri, fileName, contentType, sizeBytes, durationSeconds);
  }, []);

  return {
    uploadRecording,
    isUploading: isUploading ?? false,
    uploadStage: uploadProgress?.stage ?? null,
  };
}
