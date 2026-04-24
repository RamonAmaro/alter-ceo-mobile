import type { FileSystemUploadResult } from "expo-file-system/legacy";
import {
  FileSystemUploadType,
  getInfoAsync,
  uploadAsync,
} from "expo-file-system/legacy";

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

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    ...upload.headers,
  };

  // Streaming upload: `FileSystem.uploadAsync` lê o arquivo do disco em chunks
  // no lado nativo e envia direto para o S3. Evita carregar o arquivo inteiro
  // em memória (o que base64 + `fetch(body: bytes)` fazia antes — inviável
  // para áudios longos de 2h+ em celulares com pouca RAM).
  let result: FileSystemUploadResult;
  try {
    result = await uploadAsync(upload.upload_url, fileUri, {
      httpMethod: "PUT",
      uploadType: FileSystemUploadType.BINARY_CONTENT,
      headers,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    throw new Error(`S3 upload network error: ${message}`);
  }

  if (result.status < 200 || result.status >= 300) {
    throw new ApiError(result.status, `Upload failed with status ${result.status}`);
  }
}
