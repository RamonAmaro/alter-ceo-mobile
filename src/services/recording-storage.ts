import {
  copyAsync,
  deleteAsync,
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
} from "expo-file-system/legacy";

const RECORDINGS_DIR = `${documentDirectory}recordings/`;
const FILE_READY_ATTEMPTS = 8;
const FILE_READY_DELAY_MS = 80;

function getFileExtension(uri: string): string {
  return uri.split(".").pop()?.toLowerCase() ?? "m4a";
}

function buildPersistedRecordingUri(sourceUri: string): string {
  const extension = getFileExtension(sourceUri);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${RECORDINGS_DIR}${id}.${extension}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function ensureRecordingsDir(): Promise<void> {
  const info = await getInfoAsync(RECORDINGS_DIR);
  if (!info.exists) {
    await makeDirectoryAsync(RECORDINGS_DIR, { intermediates: true });
  }
}

async function waitForReadableFile(uri: string): Promise<void> {
  const attempts = Array.from({ length: FILE_READY_ATTEMPTS }, (_, index) => index);

  for (const attempt of attempts) {
    const info = await getInfoAsync(uri).catch(() => null);
    if (info?.exists && (info.size ?? 0) > 0) {
      return;
    }

    if (attempt < attempts.length - 1) {
      await delay(FILE_READY_DELAY_MS);
    }
  }

  throw new Error(`Recording file is not ready: ${uri}`);
}

export async function persistRecordingFile(sourceUri: string): Promise<string> {
  await ensureRecordingsDir();
  await waitForReadableFile(sourceUri);
  const destUri = buildPersistedRecordingUri(sourceUri);
  await copyAsync({ from: sourceUri, to: destUri });
  return destUri;
}

export async function deletePersistedRecording(uri: string): Promise<void> {
  if (!uri.startsWith(RECORDINGS_DIR)) return;

  try {
    await deleteAsync(uri, { idempotent: true });
  } catch {
    return;
  }
}

export async function recordingFileExists(uri: string): Promise<boolean> {
  if (!uri.startsWith("file://") && !uri.startsWith("/")) return false;

  try {
    const info = await getInfoAsync(uri);
    return info.exists && (info.size ?? 0) > 0;
  } catch {
    return false;
  }
}
