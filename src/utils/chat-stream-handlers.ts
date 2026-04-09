import type { SSEConnection } from "@/lib/sse-client";
import type { ChatMessageResponse } from "@/types/chat";
import type { SSETypedEvent } from "@/types/sse";
import { parseCompleteMessage, parseDeltaText } from "@/utils/parse-sse-chat";
import { ulid } from "@/utils/ulid";

interface ChatStreamState {
  streamingText: string;
  messages: ChatMessageResponse[];
  isStreaming: boolean;
  _sseConnection: SSEConnection | null;
  error: string | null;
}

type SetState = (
  partial: Partial<ChatStreamState> | ((state: ChatStreamState) => Partial<ChatStreamState>),
) => void;
type GetState = () => ChatStreamState;

export type { SetState as ChatStreamSetState, GetState as ChatStreamGetState };

function handleStreamEvent(
  event: SSETypedEvent,
  threadId: string,
  set: SetState,
  get: GetState,
): void {
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

export { handleStreamEvent, handleStreamDone };
