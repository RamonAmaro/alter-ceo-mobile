import { ApiError } from "@/types/api";
import type { MeetingDirectUploadPayload } from "@/types/meeting";

export async function uploadFileToS3(
  upload: MeetingDirectUploadPayload,
  fileUri: string,
  contentType: string,
): Promise<void> {
  // Pull the blob bytes. We upload as Blob rather than ArrayBuffer because
  // some mobile browsers (Android Chrome/WebView in particular) send
  // ArrayBuffer payloads as multipart or drop them entirely, producing
  // "Network Error" against S3 pre-signed URLs.
  const response = await fetch(fileUri);
  const rawBlob = await response.blob();

  // S3 signed URLs validate Content-Type against what was signed on the
  // backend. The Blob's own .type can be "audio/webm;codecs=opus" which does
  // not match "audio/webm" — we re-wrap it with the exact content type the
  // backend signed for.
  const blob = new Blob([rawBlob], { type: contentType });

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    ...upload.headers,
  };

  // Use native fetch instead of axios for the S3 PUT. Axios on mobile
  // browsers has intermittent issues with large body uploads via XHR,
  // surfacing as generic "Network Error". fetch is better supported and
  // streams the Blob natively. Also: do NOT send credentials or auth
  // headers here — S3 rejects any Authorization that isn't its own.
  let result: Response;
  try {
    result = await fetch(upload.upload_url, {
      method: "PUT",
      body: blob,
      headers,
      credentials: "omit",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    throw new Error(`S3 upload network error: ${message}`);
  }

  if (!result.ok) {
    throw new ApiError(result.status, `Upload failed with status ${result.status}`);
  }
}
