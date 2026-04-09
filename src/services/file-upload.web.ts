import { putExternal } from "@/lib/api-client";
import type { MeetingDirectUploadPayload } from "@/types/meeting";

export async function uploadFileToS3(
  upload: MeetingDirectUploadPayload,
  fileUri: string,
  contentType: string,
): Promise<void> {
  const response = await fetch(fileUri);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    ...upload.headers,
  };

  await putExternal(upload.upload_url, arrayBuffer, headers);
}
