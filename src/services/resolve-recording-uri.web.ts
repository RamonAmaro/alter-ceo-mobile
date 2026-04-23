import { isIndexedDbAudioUri, resolveAudioBlob } from "./indexed-db-audio-store";

// Web: URIs `idb-audio://` referenciam um blob no IndexedDB. Antes de usar
// num upload, precisamos recuperar os bytes — consumidores que precisarem de
// blob URL viva (playback) criam a URL localmente e revogam após uso.

export async function resolveRecordingBlob(uri: string): Promise<Blob | null> {
  if (!isIndexedDbAudioUri(uri)) return null;
  return resolveAudioBlob(uri);
}
