import { Platform } from "react-native";

import { create } from "zustand";

import { storage } from "@/lib/storage";
import { clearAllAudioBlobs, closeDatabase } from "@/services/indexed-db-audio-store";
import { deletePersistedRecording, recordingFileExists } from "@/services/recording-storage";

// Rascunho de audio: grabación que el usuario empezó en el chat pero no envió
// (ej. navegó fuera de la pantalla mientras grababa). El archivo persistido
// debe sobrevivir hasta que el usuario lo envíe o lo descarte — nunca se pierde
// silenciosamente.
//
// Estrutura: { [userId]: { [threadId]: ChatAudioDraft } }
// Apenas um draft por thread (igual ao padrão de `chat-store.drafts`).
export const CHAT_AUDIO_DRAFTS_STORAGE_KEY = "chat_audio_drafts_v1";

export interface ChatAudioDraft {
  readonly uri: string;
  readonly durationMs: number;
  readonly createdAt: string;
  // Setado após `loadDrafts` detectar que o arquivo referenciado não existe
  // mais. No web: entrada no IndexedDB apagada (quota, limpeza de dados, ITP
  // do Safari), ou URI legado `blob:` de antes da 2E. No nativo: arquivo em
  // `documentDirectory/recordings/` foi limpo pelo SO ou usuário. Quando
  // true, o banner deve oferecer apenas "Descartar".
  readonly lost?: boolean;
}

type DraftsByUser = Record<string, Record<string, ChatAudioDraft>>;

// Diferente do draft de texto (que usa debounce para evitar flood em cada
// keystroke), o draft de áudio persiste imediato: só ocorre em eventos raros
// (unmount durante gravação, envio, descarte) e perder uma gravação longa numa
// corrida com o shutdown do app é inaceitável.
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

    // Valida se cada draft ainda tem o arquivo de áudio acessível:
    // - Web: entrada no IndexedDB pode ter sido apagada (quota, limpeza de
    //   dados, ITP do Safari). Drafts antigos `blob:` sempre dão lost.
    // - Native (iOS/Android): arquivo em `documentDirectory/recordings/`
    //   pode ter sido limpo pelo SO (raro) ou usuário pelo Settings.
    // Drafts cujo arquivo sumiu recebem flag `lost: true` — o banner mostra
    // mensagem clara em es-ES e só oferece Descartar.
    const validated = await validateDrafts(parsed);
    set({ drafts: validated, hydrated: true });
    if (JSON.stringify(validated) !== JSON.stringify(parsed)) {
      await persistDrafts(validated);
    }
  },

  saveDraft: async (userId, threadId, draft) => {
    const current = get().drafts;
    const userDrafts = current[userId] ?? {};
    // Se já havia um draft anterior nesse thread, sobrescrever o arquivo em
    // disco deixaria o antigo órfão. Deletar antes é best-effort — se falhar,
    // o draft novo é gravado mesmo assim (preferir não perder o novo a garantir
    // que o antigo foi deletado).
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

    // Best-effort: apaga o arquivo de áudio persistido no disco.
    await deletePersistedRecording(previous.uri);
  },

  // Logout explícito: apaga tudo (inclusive arquivos em disco).
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

    // Web: garante que nenhum blob órfão sobra (ex: entrada com URI não-durável
    // que o `deletePersistedRecording` pulou), depois fecha a conexão pra que
    // um próximo login re-abra limpo.
    if (Platform.OS === "web") {
      await clearAllAudioBlobs();
      await closeDatabase();
    }
  },

  // 401 / troca de sessão: preserva tudo (é "pending work").
  resetKeepingDrafts: () => {
    // Nada a limpar — drafts continuam intactos.
  },
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
