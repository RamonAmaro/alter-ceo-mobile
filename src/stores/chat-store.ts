import { create } from "zustand";

import type { SSEConnection } from "@/lib/sse-client";
import * as chatService from "@/services/chat-service";
import type { ChatMessageResponse, ChatThreadSummary } from "@/types/chat";
import { handleStreamDone, handleStreamEvent } from "@/utils/chat-stream-handlers";
import { toErrorMessage } from "@/utils/to-error-message";
import { ulid } from "@/utils/ulid";

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
  _sseConnection: SSEConnection | null;

  fetchThreads: (userId: string) => Promise<void>;
  createThread: (userId: string) => Promise<string>;
  selectThread: (threadId: string) => Promise<void>;
  fetchMessages: (threadId: string) => Promise<void>;
  sendMessage: (threadId: string, message: string) => Promise<void>;
  sendAudioMessage: (threadId: string, uri: string) => Promise<void>;
  retryMessage: () => Promise<void>;
  cancelStream: () => void;
  reset: () => void;
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

  sendAudioMessage: async (threadId: string, uri: string) => {
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

  reset: () => {
    get().cancelStream();
    set({
      threads: [],
      activeThreadId: null,
      messages: [],
      isSubmittingAudio: false,
      isLoadingThreads: false,
      isLoadingMessages: false,
      error: null,
    });
  },
}));
