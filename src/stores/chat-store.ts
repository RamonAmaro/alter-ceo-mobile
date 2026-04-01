import { create } from "zustand";

import type { SSEConnection } from "@/lib/sse-client";
import * as chatService from "@/services/chat-service";
import type { ChatMessageResponse, ChatThreadSummary } from "@/types/chat";
import type { SSETypedEvent } from "@/types/sse";
import { parseCompleteMessage, parseDeltaText } from "@/utils/parse-sse-chat";
import { ulid } from "@/utils/ulid";

const ERROR_GENERIC = "No se pudo completar la operación. Inténtalo de nuevo.";

function toErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return ERROR_GENERIC;
}

type SetState = (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void;
type GetState = () => ChatState;

function handleStreamEvent(event: SSETypedEvent, threadId: string, set: SetState, get: GetState): void {
  if (event.event === "delta") {
    const chunk = parseDeltaText(event.data);
    if (chunk) {
      set((state) => ({ streamingText: state.streamingText + chunk }));
    }
  } else if (event.event === "complete") {
    const msg = parseCompleteMessage(event.data, threadId, get().streamingText);
    set((state) => ({
      messages: [...state.messages, msg],
      isStreaming: false,
      streamingText: "",
      _sseConnection: null,
    }));
  } else if (event.event === "error") {
    set({
      isStreaming: false,
      streamingText: "",
      _sseConnection: null,
      error: "Error en la respuesta del asistente",
    });
  }
}

function handleStreamDone(threadId: string, set: SetState, get: GetState): void {
  if (!get().isStreaming) return;
  const accumulated = get().streamingText;
  if (accumulated) {
    const fallbackMsg: ChatMessageResponse = {
      id: ulid(),
      thread_id: threadId,
      role: "assistant",
      text: accumulated,
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      messages: [...state.messages, fallbackMsg],
      isStreaming: false,
      streamingText: "",
      _sseConnection: null,
    }));
  } else {
    set({ isStreaming: false, streamingText: "", _sseConnection: null });
  }
}

interface ChatState {
  threads: ChatThreadSummary[];
  activeThreadId: string | null;
  messages: ChatMessageResponse[];
  isStreaming: boolean;
  streamingText: string;
  isLoadingThreads: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  failedMessageId: string | null;
  _sseConnection: SSEConnection | null;

  fetchThreads: (userId: string) => Promise<void>;
  createThread: (userId: string) => Promise<string>;
  selectThread: (threadId: string) => Promise<void>;
  fetchMessages: (threadId: string) => Promise<void>;
  sendMessage: (threadId: string, message: string) => Promise<void>;
  retryMessage: () => Promise<void>;
  cancelStream: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  threads: [],
  activeThreadId: null,
  messages: [],
  isStreaming: false,
  streamingText: "",
  isLoadingThreads: false,
  isLoadingMessages: false,
  error: null,
  failedMessageId: null,
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

  reset: () => {
    get().cancelStream();
    set({
      threads: [],
      activeThreadId: null,
      messages: [],
      isLoadingThreads: false,
      isLoadingMessages: false,
      error: null,
    });
  },
}));
