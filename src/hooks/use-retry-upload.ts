import { useCallback } from "react";

import { useRecordingsStore, type LocalRecording } from "@/stores/recordings-store";

import { useUploadRecording } from "./use-upload-recording";

export function useRetryUpload(): {
  retryUpload: (recording: LocalRecording) => Promise<void>;
  discardRecording: (recordingId: string) => Promise<void>;
} {
  const { uploadRecording } = useUploadRecording();

  const retryUpload = useCallback(
    async (recording: LocalRecording) => {
      await uploadRecording({
        recordingId: recording.id,
        uri: recording.uri,
        title: recording.title,
        durationMs: recording.durationMs,
      });
    },
    [uploadRecording],
  );

  const discardRecording = useCallback(async (recordingId: string) => {
    await useRecordingsStore.getState().deleteRecording(recordingId);
  }, []);

  return { retryUpload, discardRecording };
}
