// Descriptor returned by the platform-specific document picker.
// The shape differs a bit between native and web — this is the normalized
// version that flows into `buildPdfFormData`.
export interface PdfUploadSource {
  // Native: `file://` URI. Web: blob URL from URL.createObjectURL() OR
  // an in-memory File object exposed via `webFile` below.
  uri: string;
  name: string;
  contentType: string;
  sizeBytes: number;
  // Web-only: the actual File object. On native this is undefined.
  webFile?: File;
}
