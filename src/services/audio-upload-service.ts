import { API_BASE_URL, API_VERSION } from "@/constants/env";
import { buildAuthHeaders } from "@/lib/api-client";
import { ApiError } from "@/types/api";
import type { AudioRecordingTranscriptionResponse } from "@/types/audio";

export async function uploadAudioRecording(
  uri: string,
  userId: string,
  recordingId: string,
): Promise<AudioRecordingTranscriptionResponse> {
  const formData = new FormData();
  const isM4a = uri.endsWith(".m4a") || uri.endsWith(".aac");
  const filename = isM4a ? `${recordingId}.m4a` : `${recordingId}.wav`;
  const contentType = isM4a ? "audio/m4a" : "audio/wav";

  formData.append("file", {
    uri,
    name: filename,
    type: contentType,
  } as unknown as Blob);
  formData.append("language", "es");
  formData.append("user_id", userId);
  formData.append("recording_id", recordingId);

  const url = `${API_BASE_URL}/${API_VERSION}/audio/recordings/transcribe`;
  const headers = buildAuthHeaders();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      credentials: "omit",
      body: formData,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const raw = await response.text();
    let message = `HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (typeof parsed.detail === "string") message = parsed.detail;
    } catch {
      if (raw) message = raw.slice(0, 200);
    }
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<AudioRecordingTranscriptionResponse>;
}
