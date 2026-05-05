import { Platform } from "react-native";

import { create } from "zustand";

import { storage } from "@/lib/storage";
import { clearAllAudioBlobs, closeDatabase } from "@/services/indexed-db-audio-store";
import { deletePersistedRecording, recordingFileExists } from "@/services/recording-storage";

export const CHAT_AUDIO_DRAFTS_STORAGE_KEY = "chat_audio_drafts_v1";

export interface ChatAudioDraft {
  readonly uri: string;
  readonly durationMs: number;
  readonly createdAt: string;
  // Set when loadDrafts detects the underlying audio file is gone (IndexedDB
  // wiped on web, file purged on native). UI offers only "Descartar" in this case.
  readonly lost?: boolean;
}

type DraftsByUser = Record<string, Record<string, ChatAudioDraft>>;

async function persistDrafts(drafts: DraftsByUser): Promise<void> {
  await storage.setJSON(CHAT_AUDIO_DRAFTS_STORAGE_KEY, drafts);
}

interface ChatAudioDraftState {
  drafts: DraftsByUser;
  hydrated: boolean;
  loadDrafts: () => Promise<void>;
  saveDraft: (userId: string, threadId: string, draft: ChatAudioDraft) => Promise<void>;
  clearDraft: (userId: string, threadId: string) => Promise<void>;
  reset: () => Promise<void>;
  resetKeepingDrafts: () => void;
}

export const useChatAudioDraftStore = create<ChatAudioDraftState>((set, get) => ({
  drafts: {},
  hydrated: false,

  loadDrafts: async () => {
    const raw = await storage.getJSON<DraftsByUser>(CHAT_AUDIO_DRAFTS_STORAGE_KEY);
    const parsed = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    const validated = await validateDrafts(parsed);
    set({ drafts: validated, hydrated: true });
    if (JSON.stringify(validated) !== JSON.stringify(parsed)) {
      await persistDrafts(validated);
    }
  },

  saveDraft: async (userId, threadId, draft) => {
    const current = get().drafts;
    const userDrafts = current[userId] ?? {};
    const previous = userDrafts[threadId];
    const next: DraftsByUser = {
      ...current,
      [userId]: {
        ...userDrafts,
        [threadId]: draft,
      },
    };
    set({ drafts: next });
    await persistDrafts(next);
    if (previous && previous.uri !== draft.uri) {
      await deletePersistedRecording(previous.uri);
    }
  },

  clearDraft: async (userId, threadId) => {
    const current = get().drafts;
    const userDrafts = current[userId];
    if (!userDrafts) return;
    const previous = userDrafts[threadId];
    if (!previous) return;

    const { [threadId]: _removed, ...rest } = userDrafts;
    const next: DraftsByUser = {
      ...current,
      [userId]: rest,
    };
    set({ drafts: next });
    await persistDrafts(next);
    await deletePersistedRecording(previous.uri);
  },

  reset: async () => {
    const previous = get().drafts;
    set({ drafts: {}, hydrated: true });
    await persistDrafts({});

    const urisToDelete: string[] = [];
    for (const userDrafts of Object.values(previous)) {
      for (const draft of Object.values(userDrafts)) {
        urisToDelete.push(draft.uri);
      }
    }
    await Promise.all(urisToDelete.map((uri) => deletePersistedRecording(uri)));

    // Web only: catch orphan blobs deletePersistedRecording skipped, then close
    // the IndexedDB connection so a fresh login re-opens clean.
    if (Platform.OS === "web") {
      await clearAllAudioBlobs();
      await closeDatabase();
    }
  },

  resetKeepingDrafts: () => {},
}));

async function validateDrafts(drafts: DraftsByUser): Promise<DraftsByUser> {
  const nextByUser: DraftsByUser = {};
  for (const [userId, userDrafts] of Object.entries(drafts)) {
    const nextUserDrafts: Record<string, ChatAudioDraft> = {};
    for (const [threadId, draft] of Object.entries(userDrafts)) {
      const exists = await recordingFileExists(draft.uri).catch(() => false);
      nextUserDrafts[threadId] = exists ? draft : { ...draft, lost: true };
    }
    nextByUser[userId] = nextUserDrafts;
  }
  return nextByUser;
}
