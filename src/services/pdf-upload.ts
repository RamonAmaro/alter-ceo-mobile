import type { PdfUploadSource } from "./pdf-upload-types";

export type { PdfUploadSource } from "./pdf-upload-types";

export interface PdfUploadFields {
  user_id: string;
  company_name?: string;
  title?: string;
}

// Native implementation. React Native's FormData accepts `{ uri, name, type }`
// objects and streams the file from disk — no need to load the PDF into
// memory, which matters on Android where 50MB PDFs would otherwise blow the
// JS heap.
export async function buildPdfFormData(
  file: PdfUploadSource,
  fields: PdfUploadFields,
): Promise<FormData> {
  const formData = new FormData();
  formData.append("user_id", fields.user_id);
  if (fields.company_name) formData.append("company_name", fields.company_name);
  if (fields.title) formData.append("title", fields.title);

  // `file` is the RN-flavoured descriptor. `as unknown as Blob` is required
  // because TypeScript lib.dom.d.ts types FormData.append's value as Blob|string,
  // but RN's polyfill accepts the descriptor at runtime. This is the idiomatic
  // RN pattern and matches how expo-file-system documents uploads.
  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.contentType,
  } as unknown as Blob);

  return formData;
}
