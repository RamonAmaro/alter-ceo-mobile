import { create } from "zustand";
import type { SSEConnection } from "@/lib/sse-client";
import type { ChatMessageResponse, ChatThreadSummary } from "@/types/chat";
import * as chatService from "@/services/chat-service";

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
      set({ error: (err as Error).message, isLoadingThreads: false });
    }
  },

  createThread: async (userId: string) => {
    const response = await chatService.createThread(userId);
    set({ activeThreadId: response.thread_id, messages: [] });
    return response.thread_id;
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
      set({ error: (err as Error).message, isLoadingMessages: false });
    }
  },

  sendMessage: async (threadId: string, message: string) => {
    const turnId = `turn_${Date.now()}`;

    const userMsg: ChatMessageResponse = {
      id: `local_${Date.now()}`,
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

      const connection = chatService.streamTurnEvents(turnId, (event) => {
        if (event.event === "text_delta" || !event.event) {
          set((state) => ({
            streamingText: state.streamingText + event.data,
          }));
        } else if (event.event === "done") {
          const assistantMsg: ChatMessageResponse = {
            id: `assistant_${Date.now()}`,
            thread_id: threadId,
            role: "assistant",
            text: get().streamingText,
            created_at: new Date().toISOString(),
          };
          set((state) => ({
            messages: [...state.messages, assistantMsg],
            isStreaming: false,
            streamingText: "",
            _sseConnection: null,
          }));
        }
      });

      set({ _sseConnection: connection });
    } catch (err) {
      set({
        isStreaming: false,
        streamingText: "",
        error: (err as Error).message,
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
