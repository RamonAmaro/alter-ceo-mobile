import {
  copyAsync,
  deleteAsync,
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
} from "expo-file-system/legacy";

const RECORDINGS_DIR = `${documentDirectory}recordings/`;

async function ensureRecordingsDir(): Promise<void> {
  const info = await getInfoAsync(RECORDINGS_DIR);
  if (!info.exists) {
    await makeDirectoryAsync(RECORDINGS_DIR, { intermediates: true });
  }
}

export async function persistRecordingFile(sourceUri: string): Promise<string> {
  await ensureRecordingsDir();
  const ext = sourceUri.split(".").pop()?.toLowerCase() ?? "m4a";
  const destUri = `${RECORDINGS_DIR}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await copyAsync({ from: sourceUri, to: destUri });
  return destUri;
}

export async function deletePersistedRecording(uri: string): Promise<void> {
  if (!uri.startsWith(RECORDINGS_DIR)) return;
  try {
    await deleteAsync(uri, { idempotent: true });
  } catch {
    // best-effort
  }
}

// Verifica se o arquivo ainda existe em disco. Usado na hidratação de drafts
// para detectar arquivos que sumiram (limpeza de cache do app pelo SO, usuário
// limpou dados, bug raro) e marcar o draft como "lost" antes de exibir no UI.
export async function recordingFileExists(uri: string): Promise<boolean> {
  if (!uri.startsWith("file://") && !uri.startsWith("/")) return false;
  try {
    const info = await getInfoAsync(uri);
    return info.exists && (info.size ?? 0) > 0;
  } catch {
    return false;
  }
}
