// Web: blob URLs cannot be persisted across reloads without heavy base64-in-storage.
// Return the URI as-is — the recording survives navigation/logout within the same tab,
// which covers the 401 recovery flow. A full reload loses the blob (browser limitation).
export async function persistRecordingFile(sourceUri: string): Promise<string> {
  return sourceUri;
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
