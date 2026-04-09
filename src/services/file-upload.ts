import { putExternal } from "@/lib/api-client";
import type { MeetingDirectUploadPayload } from "@/types/meeting";
import { EncodingType, getInfoAsync, readAsStringAsync } from "expo-file-system/legacy";

export async function uploadFileToS3(
  upload: MeetingDirectUploadPayload,
  fileUri: string,
  contentType: string,
): Promise<void> {
  const fileInfo = await getInfoAsync(fileUri);
  if (!fileInfo.exists) {
    throw new Error(`File not found: ${fileUri}`);
  }

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

  await putExternal(upload.upload_url, bytes.buffer as ArrayBuffer, headers);
}
