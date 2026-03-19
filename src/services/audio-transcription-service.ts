import { postFormData } from "@/lib/api-client";
import type { AudioRecordingTranscriptionResponse } from "@/types/audio";

interface TranscribeOptions {
  language?: string;
  user_id?: string;
  recording_id?: string;
}

export async function transcribeRecording(
  fileUri: string,
  fileName: string,
  options?: TranscribeOptions,
): Promise<AudioRecordingTranscriptionResponse> {
  const formData = new FormData();

  formData.append("file", {
    uri: fileUri,
    type: "audio/m4a",
    name: fileName,
  } as unknown as Blob);

  formData.append("language", options?.language ?? "es");

  if (options?.user_id) {
    formData.append("user_id", options.user_id);
  }
  if (options?.recording_id) {
    formData.append("recording_id", options.recording_id);
  }

  return postFormData<AudioRecordingTranscriptionResponse>(
    "/audio/recordings/transcribe",
    formData,
  );
}
