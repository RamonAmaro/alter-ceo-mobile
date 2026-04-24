import { EncodingType, getInfoAsync, readAsStringAsync } from "expo-file-system/legacy";

import { ApiError } from "@/types/api";
import type { MeetingDirectUploadPayload } from "@/types/meeting";

export async function uploadFileToS3(
  upload: MeetingDirectUploadPayload,
  fileUri: string,
  contentType: string,
): Promise<void> {
  const fileInfo = await getInfoAsync(fileUri);
  if (!fileInfo.exists) {
    throw new Error(`File not found: ${fileUri}`);
  }

  // React Native's fetch() cannot read `file://` URIs directly on Android in
  // a portable way, so we read as base64 and decode to bytes ourselves.
  const base64 = await readAsStringAsync(fileUri, {
    encoding: EncodingType.Base64,
  });

  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    ...upload.headers,
  };

  // Use fetch() for the S3 PUT (not axios) to match the web upload path.
  // Keeps upload behavior identical across native and web: same method, same
  // headers, no credentials, same error surface.
  let response: Response;
  try {
    response = await fetch(upload.upload_url, {
      method: "PUT",
      body: bytes,
      headers,
      credentials: "omit",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    throw new Error(`S3 upload network error: ${message}`);
  }

  if (!response.ok) {
    throw new ApiError(response.status, `Upload failed with status ${response.status}`);
  }
}
