// Web: the recorder-owned blob URL is revoked when the recorder hook unmounts
// or prepares a new recording. If we kept the raw URL, a subsequent upload or
// playback would fail with ERR_FILE_NOT_FOUND. Clone the bytes into a fresh
// blob URL that we own so it survives until explicitly deleted.
//
// Persistence across full page reload is still NOT supported — the new blob
// URL lives only within the current tab. That matches the previous behavior
// and covers the 401/navigation recovery flow.

export async function persistRecordingFile(sourceUri: string): Promise<string> {
  if (!sourceUri.startsWith("blob:")) return sourceUri;
  const response = await fetch(sourceUri);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function deletePersistedRecording(uri: string): Promise<void> {
  if (uri.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(uri);
    } catch {
      // best-effort
    }
  }
}
