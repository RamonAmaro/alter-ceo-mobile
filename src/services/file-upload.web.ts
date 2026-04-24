import { resolveRecordingBlob } from "@/services/resolve-recording-uri";
import { ApiError } from "@/types/api";
import type { MeetingDirectUploadPayload } from "@/types/meeting";

export async function uploadFileToS3(
  upload: MeetingDirectUploadPayload,
  fileUri: string,
  contentType: string,
): Promise<void> {
  const persistedBlob = await resolveRecordingBlob(fileUri);
  let rawBlob: Blob;

  if (persistedBlob) {
    rawBlob = persistedBlob;
  } else {
    rawBlob = await fetch(fileUri).then((response) => response.blob());
  }

  const blob = new Blob([rawBlob], { type: contentType });
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    ...upload.headers,
  };

  let result: Response;

  try {
    result = await fetch(upload.upload_url, {
      method: "PUT",
      body: blob,
      headers,
      credentials: "omit",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    throw new Error(`S3 upload network error: ${message}`);
  }

  if (!result.ok) {
    throw new ApiError(result.status, `Upload failed with status ${result.status}`);
  }
}
