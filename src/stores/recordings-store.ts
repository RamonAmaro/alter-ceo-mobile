import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export const LOCAL_RECORDINGS_STORAGE_KEY = "local_recordings";

export type UploadStatus = "local_only" | "uploading" | "processing" | "completed" | "failed";

export interface LocalRecording {
  id: string;
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
  loadRecordings: () => Promise<void>;
  addRecording: (rec: LocalRecording) => Promise<void>;
  deleteRecording: (id: string) => Promise<void>;
  reset: () => Promise<void>;
  updateRecordingStatus: (id: string, patch: RecordingStatusPatch) => Promise<void>;
}

export const useRecordingsStore = create<RecordingsState>((set, get) => ({
  recordings: [],

  loadRecordings: async () => {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_RECORDINGS_STORAGE_KEY);
      const parsed: LocalRecording[] = raw ? JSON.parse(raw) : [];
      set({ recordings: parsed });
    } catch {
      set({ recordings: [] });
    }
  },

  addRecording: async (rec: LocalRecording) => {
    const next = [rec, ...get().recordings];
    set({ recordings: next });
    try {
      await AsyncStorage.setItem(LOCAL_RECORDINGS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // persisting is best-effort; in-memory state is already updated
    }
  },

  deleteRecording: async (id: string) => {
    const next = get().recordings.filter((r) => r.id !== id);
    set({ recordings: next });
    try {
      await AsyncStorage.setItem(LOCAL_RECORDINGS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // persisting is best-effort; in-memory state is already updated
    }
  },

  reset: async () => {
    set({ recordings: [] });
    try {
      await AsyncStorage.removeItem(LOCAL_RECORDINGS_STORAGE_KEY);
    } catch {
      // best-effort clear}
    }
  },
  updateRecordingStatus: async (id: string, patch: RecordingStatusPatch) => {
    const next = get().recordings.map((r) => (r.id === id ? { ...r, ...patch } : r));
    set({ recordings: next });
    try {
      await AsyncStorage.setItem(LOCAL_RECORDINGS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // persisting is best-effort; in-memory state is already updated
    }
  },
}));
