import { create } from "zustand";

import { storage } from "@/lib/storage";
import { deletePersistedRecording } from "@/services/recording-storage";

export const LOCAL_RECORDINGS_STORAGE_KEY = "local_recordings";

export type UploadStatus = "local_only" | "uploading" | "processing" | "completed" | "failed";

export interface LocalRecording {
  id: string;
  userId: string;
  uri: string;
  title: string;
  date: string;
  durationMs: number;
  createdAt: string;
  meetingId?: string;
  uploadStatus?: UploadStatus;
  errorMessage?: string;
}

type RecordingStatusPatch = Partial<
  Pick<LocalRecording, "meetingId" | "uploadStatus" | "errorMessage">
>;

interface RecordingsState {
  recordings: LocalRecording[];
  currentUserId: string | null;
  loadRecordings: (userId: string) => Promise<void>;
  addRecording: (rec: LocalRecording) => Promise<void>;
  deleteRecording: (id: string) => Promise<void>;
  reset: () => Promise<void>;
  resetKeepingPending: () => Promise<void>;
  updateRecordingStatus: (id: string, patch: RecordingStatusPatch) => Promise<void>;
}

const PENDING_STATUSES: ReadonlySet<UploadStatus> = new Set([
  "local_only",
  "uploading",
  "processing",
  "failed",
]);

export const useRecordingsStore = create<RecordingsState>((set, get) => ({
  recordings: [],
  currentUserId: null,

  loadRecordings: async (userId: string) => {
    const raw = await storage.getJSON<LocalRecording[]>(LOCAL_RECORDINGS_STORAGE_KEY);
    const parsed = Array.isArray(raw) ? raw : [];
    // Garbage-collect handed-off recordings: once the backend owns them
    // (meetingId set + processing/completed), the local copy is no longer useful.
    const pruned = parsed.filter((r) => {
      if (!r.meetingId) return true;
      return r.uploadStatus === "local_only" || r.uploadStatus === "failed";
    });
    // Quando um recording é podado do AsyncStorage por ter sido handed off
    // ao backend, o arquivo local também precisa ser apagado — do contrário
    // acumula lixo em `documentDirectory/recordings/` (nativo) ou no
    // IndexedDB (web) até o usuário reinstalar o app.
    const removedUris = parsed.filter((r) => !pruned.some((p) => p.id === r.id)).map((r) => r.uri);
    await Promise.all(removedUris.map((uri) => deletePersistedRecording(uri)));
    // In-memory state is scoped to the current user; other users' recordings
    // remain in the persisted blob so they are restored when those users sign
    // back in on this device.
    const forCurrentUser = pruned.filter((r) => r.userId === userId);
    set({ recordings: forCurrentUser, currentUserId: userId });
    if (pruned.length !== parsed.length) {
      await storage.setJSON(LOCAL_RECORDINGS_STORAGE_KEY, pruned);
    }
  },

  addRecording: async (rec: LocalRecording) => {
    const next = [rec, ...get().recordings];
    set({ recordings: next });
    await persistAllMerging(next);
  },

  deleteRecording: async (id: string) => {
    const target = get().recordings.find((r) => r.id === id);
    const next = get().recordings.filter((r) => r.id !== id);
    set({ recordings: next });
    await persistAllMerging(next);
    if (target?.uri) await deletePersistedRecording(target.uri);
  },

  // In-memory clear only — persisted recordings of THIS user remain on disk,
  // so signing back in restores them. Recordings are only purged when the
  // user uninstalls the app.
  reset: async () => {
    set({ recordings: [], currentUserId: null });
  },

  // Preserves pending recordings (local_only/uploading/processing/failed) of
  // the current user in memory. Used on 401.
  resetKeepingPending: async () => {
    const kept = get().recordings.filter((r) =>
      r.uploadStatus ? PENDING_STATUSES.has(r.uploadStatus) : false,
    );
    set({ recordings: kept });
    await persistAllMerging(kept);
  },

  updateRecordingStatus: async (id: string, patch: RecordingStatusPatch) => {
    const next = get().recordings.map((r) => (r.id === id ? { ...r, ...patch } : r));
    set({ recordings: next });
    await persistAllMerging(next);
  },
}));

// Merge the current user's in-memory recordings back into the persisted blob,
// preserving recordings that belong to other users on the same device.
async function persistAllMerging(currentUserRecordings: LocalRecording[]): Promise<void> {
  const currentUserId = useRecordingsStore.getState().currentUserId;
  const raw = await storage.getJSON<LocalRecording[]>(LOCAL_RECORDINGS_STORAGE_KEY);
  const existing = Array.isArray(raw) ? raw : [];
  const others = currentUserId ? existing.filter((r) => r.userId !== currentUserId) : existing;
  const merged = [...currentUserRecordings, ...others];
  await storage.setJSON(LOCAL_RECORDINGS_STORAGE_KEY, merged);
}
