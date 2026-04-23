import { useCallback } from "react";
import { Platform } from "react-native";
import { getInfoAsync } from "expo-file-system/legacy";

import { resolveRecordingBlob } from "@/services/resolve-recording-uri";
import { useAuthStore } from "@/stores/auth-store";
import { useMeetingStore } from "@/stores/meeting-store";
import { useRecordingsStore } from "@/stores/recordings-store";
import { toErrorMessage } from "@/utils/to-error-message";

// No web, um URI pode ser tanto uma `blob:` URL (sessão atual) quanto um
// `idb-audio://` (persistido em IndexedDB). Essa função abstrai a diferença
// e retorna o Blob para ambos — necessário porque `fetch("idb-audio://...")`
// falharia com scheme não-reconhecido.
async function loadWebBlob(uri: string): Promise<Blob | null> {
  const durable = await resolveRecordingBlob(uri);
  if (durable) return durable;
  try {
    const response = await fetch(uri);
    if (!response.ok) return null;
    return await response.blob();
  } catch {
    return null;
  }
}

function getContentTypeFromExt(uri: string): string {
  const ext = uri.split(".").pop()?.toLowerCase();
  if (ext === "m4a" || ext === "mp4") return "audio/mp4";
  if (ext === "3gp") return "audio/3gpp";
  if (ext === "webm") return "audio/webm";
  if (ext === "ogg") return "audio/ogg";
  return "audio/mp4";
}

function contentTypeFromBlob(blob: Blob, fallback: string): string {
  if (!blob.type) return fallback;
  // Normalize: strip codecs parameter ("audio/webm;codecs=opus" → "audio/webm"),
  // S3 signed URLs expect the exact Content-Type used at signing time.
  return blob.type.split(";")[0].trim();
}

interface SourceMetadata {
  readonly available: boolean;
  readonly contentType: string;
  readonly sizeBytes: number;
}

// Uma única leitura do arquivo/blob para extrair tudo que precisamos. No web,
// `loadWebBlob` lê do IndexedDB uma vez e reutiliza o mesmo Blob pra todas as
// checagens — evita abrir 4 transações IndexedDB para um arquivo de 50MB.
// No native, `getInfoAsync` é barato (metadata), mas mesmo assim consolidar
// aqui mantém o fluxo simétrico entre plataformas.
async function inspectSource(uri: string): Promise<SourceMetadata> {
  if (Platform.OS === "web") {
    const blob = await loadWebBlob(uri);
    if (!blob || blob.size === 0) {
      return { available: false, contentType: getContentTypeFromExt(uri), sizeBytes: 0 };
    }
    return {
      available: true,
      contentType: contentTypeFromBlob(blob, getContentTypeFromExt(uri)),
      sizeBytes: blob.size,
    };
  }

  try {
    const info = await getInfoAsync(uri);
    const exists = info.exists && (info.size ?? 0) > 0;
    return {
      available: exists,
      contentType: getContentTypeFromExt(uri),
      sizeBytes: exists ? (info.size ?? 0) : 0,
    };
  } catch {
    return { available: false, contentType: getContentTypeFromExt(uri), sizeBytes: 0 };
  }
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

      // Uma única inspeção do arquivo: verifica disponibilidade + content-type
      // + tamanho. No web isso é especialmente importante — cada leitura abre
      // uma transação IndexedDB, e fazer 3-4 delas sequenciais para um blob
      // de 50MB é lento.
      const { available, contentType, sizeBytes } = await inspectSource(uri);
      // On web, a blob URL from a previous session is revoked after reload and
      // any retry would fail with ERR_FILE_NOT_FOUND. Detect that up front so
      // we don't create an orphan meeting on the backend for a file we can no
      // longer upload.
      if (!available) {
        await recordingsStore.updateRecordingStatus(recordingId, {
          uploadStatus: "failed",
          errorMessage: LOST_SOURCE_ERROR_ES,
        });
        return;
      }

      const ext =
        contentType === "audio/3gpp"
          ? "3gp"
          : contentType === "audio/webm"
            ? "webm"
            : contentType === "audio/ogg"
              ? "ogg"
              : "m4a";
      const fileName = `${title.replace(/\s+/g, "-").toLowerCase()}.${ext}`;
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
