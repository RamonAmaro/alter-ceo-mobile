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
