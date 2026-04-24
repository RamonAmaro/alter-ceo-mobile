import type { PdfUploadSource } from "./pdf-upload-types";

export type { PdfUploadSource } from "./pdf-upload-types";

export interface PdfUploadFields {
  user_id: string;
  company_name?: string;
  title?: string;
}

// Web implementation. FormData in browsers takes a real File/Blob — using the
// `{ uri, name, type }` descriptor here would serialize as "[object Object]"
// and the backend would reject it as an invalid PDF.
export async function buildPdfFormData(
  file: PdfUploadSource,
  fields: PdfUploadFields,
): Promise<FormData> {
  const formData = new FormData();
  formData.append("user_id", fields.user_id);
  if (fields.company_name) formData.append("company_name", fields.company_name);
  if (fields.title) formData.append("title", fields.title);

  const blob = file.webFile ?? (await fetchBlob(file.uri, file.contentType));
  formData.append("file", blob, file.name);

  return formData;
}

async function fetchBlob(uri: string, contentType: string): Promise<Blob> {
  const response = await fetch(uri);
  const raw = await response.blob();
  // Re-wrap so the multipart part carries the exact content type we want,
  // rather than whatever the browser inferred from the blob URL.
  return new Blob([raw], { type: contentType });
}
