import type { ChatMessageResponse } from "@/types/chat";
import { ulid } from "@/utils/ulid";

export function parseDeltaText(data: string): string {
  try {
    return (JSON.parse(data) as { text?: string }).text ?? "";
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
    const parsed = JSON.parse(data) as { message?: ChatMessageResponse };
    return parsed.message ?? fallback;
  } catch {
    return fallback;
  }
}
