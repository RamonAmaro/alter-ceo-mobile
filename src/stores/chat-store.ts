import { create } from "zustand";

import type { SSEConnection } from "@/lib/sse-client";
import * as chatService from "@/services/chat-service";
import type { ChatMessageResponse, ChatThreadSummary } from "@/types/chat";
import { parseCompleteMessage, parseDeltaText } from "@/utils/parse-sse-chat";
import { ulid } from "@/utils/ulid";

const ERROR_GENERIC = "No se pudo completar la operación. Inténtalo de nuevo.";

function toErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return ERROR_GENERIC;
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
  _sseConnection: SSEConnection | null;

  fetchThreads: (userId: string) => Promise<void>;
  createThread: (userId: string) => Promise<string>;
  selectThread: (threadId: string) => Promise<void>;
  fetchMessages: (threadId: string) => Promise<void>;
  sendMessage: (threadId: string, message: string) => Promise<void>;
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
    const turnId = ulid();

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
    }));

    try {
      await chatService.createTurn(threadId, { turn_id: turnId, message });

      const connection = chatService.streamTurnEvents(
        turnId,
        (event) => {
          if (event.event === "delta") {
            const chunk = parseDeltaText(event.data);
            set((state) => ({
              streamingText: state.streamingText + chunk,
            }));
          } else if (event.event === "complete") {
            const msg = parseCompleteMessage(
              event.data,
              threadId,
              get().streamingText,
            );
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
        },
        undefined,
        () => {
          if (get().isStreaming) {
            set({ isStreaming: false, streamingText: "", _sseConnection: null });
          }
        },
        (err) => {
          set({
            isStreaming: false,
            streamingText: "",
            _sseConnection: null,
            error: toErrorMessage(err),
          });
        },
      );

      set({ _sseConnection: connection });
    } catch (err) {
      set({
        isStreaming: false,
        streamingText: "",
        error: toErrorMessage(err),
      });
    }
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
