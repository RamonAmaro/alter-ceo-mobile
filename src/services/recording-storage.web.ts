import {
  deleteAudioBlob,
  hasAudioBlob,
  isIndexedDbAudioUri,
  saveAudioBlob,
} from "./indexed-db-audio-store";

// Web: `blob:` URLs do MediaRecorder são válidas só enquanto a aba está aberta.
// Para que o borrador de áudio sobreviva reload/kill da aba, copiamos os bytes
// para IndexedDB e retornamos um URI sintético `idb-audio://{id}` que pode ser
// salvo com segurança no AsyncStorage.
//
// Drafts antigos que ainda usam `blob:` URL continuam funcionando dentro da
// sessão em curso — só somem no próximo reload (migração transparente: ao
// passar por aqui de novo, viram `idb-audio://`).

export async function persistRecordingFile(sourceUri: string): Promise<string> {
  if (isIndexedDbAudioUri(sourceUri)) return sourceUri;
  if (!sourceUri.startsWith("blob:")) return sourceUri;

  const response = await fetch(sourceUri);
  const blob = await response.blob();
  const persisted = await saveAudioBlob(blob);
  // Revoga o blob URL original após copiar os bytes. Sem isso, cada draft
  // deixaria o URL do MediaRecorder anterior vivo em memória até o reload
  // (o MediaRecorder do expo-audio não revoga sozinho).
  try {
    URL.revokeObjectURL(sourceUri);
  } catch {
    // best-effort
  }
  return persisted;
}

export async function deletePersistedRecording(uri: string): Promise<void> {
  if (isIndexedDbAudioUri(uri)) {
    await deleteAudioBlob(uri);
    return;
  }
  if (uri.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(uri);
    } catch {
      // best-effort
    }
  }
}

// Verifica se o recording ainda existe. Na web, só URIs `idb-audio://` são
// duráveis; `blob:` URLs morrem no reload e devem retornar false.
export async function recordingFileExists(uri: string): Promise<boolean> {
  if (isIndexedDbAudioUri(uri)) return hasAudioBlob(uri);
  return false;
}
