import type { ChatMessageResponse, MessageKind } from "@/types/chat";
import { ulid } from "@/utils/ulid";

function hasDeltaText(value: unknown): value is { text: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "text" in value &&
    typeof (value as { text: unknown }).text === "string"
  );
}

interface CompletePayload {
  message: ChatMessageResponse;
  message_kind?: string;
}

function hasCompleteMessage(value: unknown): value is CompletePayload {
  return typeof value === "object" && value !== null && "message" in value;
}

export function parseDeltaText(data: string): string {
  try {
    const parsed: unknown = JSON.parse(data);
    return hasDeltaText(parsed) ? parsed.text : "";
  } catch {
    return data;
  }
}

export function parseCompleteMessage(
  data: string,
  threadId: string,
  streamingText: string,
): ChatMessageResponse {
  const fallback: ChatMessageResponse = {
    id: ulid(),
    thread_id: threadId,
    role: "assistant",
    text: streamingText,
    created_at: new Date().toISOString(),
  };
  try {
    const parsed: unknown = JSON.parse(data);
    if (!hasCompleteMessage(parsed)) return fallback;

    const msg = parsed.message as ChatMessageResponse;
    const kind = (msg.message_kind ?? parsed.message_kind) as MessageKind | undefined;

    return kind ? { ...msg, message_kind: kind } : msg;
  } catch {
    return fallback;
  }
}
