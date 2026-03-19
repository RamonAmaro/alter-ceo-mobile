import { get, post } from "@/lib/api-client";
import { connectSSE, type SSEConnection } from "@/lib/sse-client";
import type { SSEEvent } from "@/utils/sse-parser";
import type {
  ChatMessagesResponse,
  ChatThreadResponse,
  ChatTurnCreateRequest,
  ChatTurnCreateResponse,
  UserChatThreadsResponse,
} from "@/types/chat";

export async function createThread(
  userId: string,
): Promise<ChatThreadResponse> {
  return post<ChatThreadResponse>("/chat/threads", { user_id: userId });
}

export async function listUserThreads(
  userId: string,
  limit?: number,
): Promise<UserChatThreadsResponse> {
  const params: Record<string, string> = {};
  if (limit != null) params.limit = String(limit);
  return get<UserChatThreadsResponse>(
    `/users/${userId}/chat/threads`,
    params,
  );
}

export async function listMessages(
  threadId: string,
): Promise<ChatMessagesResponse> {
  return get<ChatMessagesResponse>(`/chat/threads/${threadId}/messages`);
}

export async function createTurn(
  threadId: string,
  request: ChatTurnCreateRequest,
): Promise<ChatTurnCreateResponse> {
  return post<ChatTurnCreateResponse>(
    `/chat/threads/${threadId}/turns`,
    request,
  );
}

export function streamTurnEvents(
  turnId: string,
  onEvent: (event: SSEEvent) => void,
  afterEventId?: string,
): SSEConnection {
  return connectSSE(`/chat/turns/${turnId}/events`, {
    onEvent,
    afterEventId,
  });
}
