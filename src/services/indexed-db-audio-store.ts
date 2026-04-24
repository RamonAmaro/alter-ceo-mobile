// Native stub. IndexedDB não existe em iOS/Android. No nativo, a persistência
// durável de áudio vive em `documentDirectory/recordings/` via
// `recording-storage.ts`, não aqui. Este arquivo existe apenas para evitar que
// imports estáticos/dinâmicos para `indexed-db-audio-store` quebrem o build
// nativo. Nenhuma dessas funções deveria ser chamada em prática (o código
// correto em native usa `resolve-recording-uri.ts` + `recording-storage.ts`).

export function isIndexedDbAudioUri(_uri: string): boolean {
  return false;
}

export async function saveAudioBlob(_blob: Blob): Promise<string> {
  throw new Error("saveAudioBlob is web-only");
}

export async function resolveAudioBlob(_uri: string): Promise<Blob | null> {
  return null;
}

export async function hasAudioBlob(_uri: string): Promise<boolean> {
  return false;
}

export async function deleteAudioBlob(_uri: string): Promise<void> {
  // no-op
}

export async function closeDatabase(): Promise<void> {
  // no-op
}

export async function clearAllAudioBlobs(): Promise<void> {
  // no-op
}
