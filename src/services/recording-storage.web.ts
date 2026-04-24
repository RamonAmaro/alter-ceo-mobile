import {
  deleteAudioBlob,
  hasAudioBlob,
  isIndexedDbAudioUri,
  saveAudioBlob,
} from "./indexed-db-audio-store";

function revokeObjectUrl(uri: string): void {
  try {
    URL.revokeObjectURL(uri);
  } catch {
    return;
  }
}

export async function persistRecordingFile(sourceUri: string): Promise<string> {
  if (isIndexedDbAudioUri(sourceUri)) return sourceUri;
  if (!sourceUri.startsWith("blob:")) return sourceUri;

  const response = await fetch(sourceUri);
  const blob = await response.blob();
  const persistedUri = await saveAudioBlob(blob);
  revokeObjectUrl(sourceUri);
  return persistedUri;
}

export async function deletePersistedRecording(uri: string): Promise<void> {
  if (isIndexedDbAudioUri(uri)) {
    await deleteAudioBlob(uri);
    return;
  }

  if (uri.startsWith("blob:")) {
    revokeObjectUrl(uri);
  }
}

export async function recordingFileExists(uri: string): Promise<boolean> {
  if (isIndexedDbAudioUri(uri)) return hasAudioBlob(uri);
  return false;
}
