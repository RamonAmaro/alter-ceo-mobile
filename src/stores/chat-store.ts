import { create } from "zustand";

import type { SSEConnection } from "@/lib/sse-client";
import { storage } from "@/lib/storage";
import * as chatService from "@/services/chat-service";
import { createPersistDebouncer } from "@/services/persist-debounce-service";
import type { ChatMessageResponse, ChatThreadSummary } from "@/types/chat";
import { handleStreamDone, handleStreamEvent } from "@/utils/chat-stream-handlers";
import { toErrorMessage } from "@/utils/to-error-message";
import { ulid } from "@/utils/ulid";

// Drafts: texto no input que o usuário ainda não enviou. Preservado em 401.
// Estrutura: { [userId]: { [threadId]: text } }
// Chave especial `__new__` guarda o draft de uma conversa ainda não criada.
export const CHAT_DRAFTS_STORAGE_KEY = "chat_drafts_v1";
export const NEW_THREAD_DRAFT_KEY = "__new__";

type DraftsByUser = Record<string, Record<string, string>>;

const DRAFT_DEBOUNCE_MS = 400;

async function persistDrafts(drafts: DraftsByUser): Promise<void> {
  await storage.setJSON(CHAT_DRAFTS_STORAGE_KEY, drafts);
}

const draftDebouncer = createPersistDebouncer<DraftsByUser>(persistDrafts, DRAFT_DEBOUNCE_MS);

interface ChatState {
  threads: ChatThreadSummary[];
  activeThreadId: string | null;
  messages: ChatMessageResponse[];
  isStreaming: boolean;
  isSubmittingAudio: boolean;
  streamingText: string;
  isLoadingThreads: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  failedMessageId: string | null;
  drafts: DraftsByUser;
  _sseConnection: SSEConnection | null;

  fetchThreads: (userId: string) => Promise<void>;
  createThread: (userId: string) => Promise<string>;
  selectThread: (threadId: string) => Promise<void>;
  fetchMessages: (threadId: string) => Promise<void>;
  sendMessage: (threadId: string, message: string) => Promise<void>;
  sendAudioMessage: (threadId: string, uri: string) => Promise<void>;
  retryMessage: () => Promise<void>;
  cancelStream: () => void;
  loadDrafts: () => Promise<void>;
  setDraft: (userId: string, threadKey: string, text: string) => void;
  getDraft: (userId: string, threadKey: string) => string;
  clearDraft: (userId: string, threadKey: string) => void;
  reset: () => void;
  resetKeepingDrafts: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  threads: [],
  activeThreadId: null,
  messages: [],
  isStreaming: false,
  isSubmittingAudio: false,
  streamingText: "",
  isLoadingThreads: false,
  isLoadingMessages: false,
  error: null,
  failedMessageId: null,
  drafts: {},
  _sseConnection: null,

  fetchThreads: async (userId: string) => {
    set({ isLoadingThreads: true, error: null });
    try {
      const response = await chatService.listUserThreads(userId);
      set({ threads: response.threads ?? [], isLoadingThreads: false });
    } catch (err) {
      set({ error: toErrorMessage(err), isLoadingThreads: false });
    }
  },

  createThread: async (userId: string) => {
    try {
      const response = await chatService.createThread(userId);
      const newThread: ChatThreadSummary = {
        thread_id: response.thread_id,
        user_id: response.user_id,
        created_at: response.created_at,
        updated_at: response.created_at,
      };
      set((state) => ({
        activeThreadId: response.thread_id,
        messages: [],
        threads: [newThread, ...state.threads],
      }));
      return response.thread_id;
    } catch (err) {
      set({ error: toErrorMessage(err) });
      throw err;
    }
  },

  selectThread: async (threadId: string) => {
    set({ activeThreadId: threadId, messages: [] });
    await get().fetchMessages(threadId);
  },

  fetchMessages: async (threadId: string) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const response = await chatService.listMessages(threadId);
      set({ messages: response.messages ?? [], isLoadingMessages: false });
    } catch (err) {
      set({ error: toErrorMessage(err), isLoadingMessages: false });
    }
  },

  sendMessage: async (threadId: string, message: string) => {
    if (get().isStreaming || get().isSubmittingAudio) return;

    const userMsg: ChatMessageResponse = {
      id: ulid(),
      thread_id: threadId,
      role: "user",
      text: message,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isStreaming: true,
      streamingText: "",
      error: null,
      failedMessageId: null,
    }));

    try {
      const turnId = ulid();
      await chatService.createTurn(threadId, { turn_id: turnId, message });

      const connection = chatService.streamTurnEvents(
        turnId,
        (event) => handleStreamEvent(event, threadId, set, get),
        undefined,
        () => handleStreamDone(threadId, set, get),
        (err) =>
          set({
            isStreaming: false,
            streamingText: "",
            _sseConnection: null,
            error: toErrorMessage(err),
          }),
      );
      set({ _sseConnection: connection });
    } catch (err) {
      set({
        isStreaming: false,
        streamingText: "",
        error: toErrorMessage(err),
        failedMessageId: userMsg.id,
      });
    }
  },

  sendAudioMessage: async (threadId: string, uri: string) => {
    if (get().isSubmittingAudio || get().isStreaming) return;

    get()._sseConnection?.abort();

    set({
      isSubmittingAudio: true,
      error: null,
      failedMessageId: null,
      _sseConnection: null,
    });

    try {
      const turnId = ulid();
      const response = await chatService.createAudioTurn(threadId, {
        turn_id: turnId,
        uri,
        language: "es",
      });

      const userMsg: ChatMessageResponse = {
        id: response.user_message_id,
        thread_id: threadId,
        role: "user",
        // Intentional `||` (not `??`): empty string should also fall back.
        text: response.transcript.trim() || "Mensaje de audio enviado",
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, userMsg],
        isSubmittingAudio: false,
        isStreaming: true,
        streamingText: "",
        error: null,
      }));

      const connection = chatService.streamTurnEvents(
        response.turn_id,
        (event) => handleStreamEvent(event, threadId, set, get),
        undefined,
        () => handleStreamDone(threadId, set, get),
        (err) =>
          set({
            isStreaming: false,
            streamingText: "",
            _sseConnection: null,
            error: toErrorMessage(err),
          }),
      );
      set({ _sseConnection: connection });
    } catch (err) {
      set({
        isSubmittingAudio: false,
        isStreaming: false,
        streamingText: "",
        _sseConnection: null,
        error: toErrorMessage(err),
      });
    }
  },

  retryMessage: async () => {
    const { messages, activeThreadId, failedMessageId } = get();
    if (!failedMessageId || !activeThreadId) return;
    const failedMsg = messages.find((m) => m.id === failedMessageId);
    if (!failedMsg) return;
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== failedMessageId),
      failedMessageId: null,
      error: null,
    }));
    await get().sendMessage(activeThreadId, failedMsg.text);
  },

  cancelStream: () => {
    get()._sseConnection?.abort();
    set({ isStreaming: false, streamingText: "", _sseConnection: null });
  },

  loadDrafts: async () => {
    const raw = await storage.getJSON<DraftsByUser>(CHAT_DRAFTS_STORAGE_KEY);
    const parsed = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    set({ drafts: parsed });
  },

  setDraft: (userId: string, threadKey: string, text: string) => {
    const current = get().drafts;
    const userDrafts = current[userId] ?? {};
    const nextUserDrafts = text
      ? { ...userDrafts, [threadKey]: text }
      : Object.fromEntries(Object.entries(userDrafts).filter(([k]) => k !== threadKey));
    const next: DraftsByUser = { ...current, [userId]: nextUserDrafts };
    set({ drafts: next });
    draftDebouncer.schedule(() => get().drafts);
  },

  getDraft: (userId: string, threadKey: string) => {
    return get().drafts[userId]?.[threadKey] ?? "";
  },

  clearDraft: (userId: string, threadKey: string) => {
    get().setDraft(userId, threadKey, "");
  },

  // Reset transient in-memory state. Persisted drafts in AsyncStorage are kept
  // intact — they are scoped per-userId inside the blob, so returning users
  // (same or different) restore their own drafts on sign-in. Drafts only go
  // away when the user actively sends the message or uninstalls the app.
  reset: () => {
    get().cancelStream();
    draftDebouncer.cancel();
    set({
      threads: [],
      activeThreadId: null,
      messages: [],
      isSubmittingAudio: false,
      isLoadingThreads: false,
      isLoadingMessages: false,
      error: null,
      drafts: {},
    });
  },

  resetKeepingDrafts: () => {
    get().cancelStream();
    set({
      threads: [],
      activeThreadId: null,
      messages: [],
      isSubmittingAudio: false,
      isLoadingThreads: false,
      isLoadingMessages: false,
      error: null,
      // drafts preserved intentionally
    });
  },
}));
