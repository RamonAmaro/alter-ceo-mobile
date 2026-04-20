import { Platform } from "react-native";

import { get, post, postFormData } from "@/lib/api-client";
import { connectSSE, type SSEConnection } from "@/lib/sse-client";
import type { SSETypedEvent } from "@/types/sse";
import type {
  ChatAudioTurnCreateRequest,
  ChatAudioTurnCreateResponse,
  ChatMessagesResponse,
  ChatThreadResponse,
  ChatTurnCreateRequest,
  ChatTurnCreateResponse,
  UserChatThreadsResponse,
} from "@/types/chat";

export async function createThread(userId: string): Promise<ChatThreadResponse> {
  return post<ChatThreadResponse>("/chat/threads", { user_id: userId });
}

export async function listUserThreads(
  userId: string,
  limit?: number,
): Promise<UserChatThreadsResponse> {
  const params: Record<string, string> = {};
  if (limit != null) params.limit = String(limit);
  return get<UserChatThreadsResponse>(`/users/${userId}/chat/threads`, params);
}

export async function listMessages(threadId: string): Promise<ChatMessagesResponse> {
  return get<ChatMessagesResponse>(`/chat/threads/${threadId}/messages`);
}

export async function createTurn(
  threadId: string,
  request: ChatTurnCreateRequest,
): Promise<ChatTurnCreateResponse> {
  return post<ChatTurnCreateResponse>(`/chat/threads/${threadId}/turns`, request);
}

function inferContentType(uri: string): string {
  const normalizedUri = uri.split("?")[0]?.toLowerCase() ?? "";
  const extension = normalizedUri.split(".").pop();

  if (extension === "webm" || uri.startsWith("blob:")) return "audio/webm";
  if (extension === "ogg") return "audio/ogg";
  if (extension === "wav") return "audio/wav";
  if (extension === "mp3") return "audio/mp3";
  if (extension === "mpeg") return "audio/mpeg";
  if (extension === "mp4") return "audio/mp4";
  if (extension === "m4a") return "audio/m4a";
  if (extension === "flac") return "audio/flac";
  if (extension === "amr") return "audio/amr";
  if (extension === "aac") return "audio/aac";

  return "audio/m4a";
}

function inferExtension(contentType: string): string {
  if (contentType === "audio/webm") return "webm";
  if (contentType === "audio/ogg") return "ogg";
  if (contentType === "audio/wav") return "wav";
  if (contentType === "audio/mp3" || contentType === "audio/mpeg") return "mp3";
  if (contentType === "audio/mp4") return "mp4";
  if (contentType === "audio/flac") return "flac";
  if (contentType === "audio/amr") return "amr";
  if (contentType === "audio/aac") return "aac";
  return "m4a";
}

async function appendAudioFile(formData: FormData, uri: string, turnId: string): Promise<void> {
  const inferredType = inferContentType(uri);
  const fileName = `voice-note-${turnId}.${inferExtension(inferredType)}`;

  if (Platform.OS === "web" || uri.startsWith("blob:")) {
    const response = await fetch(uri);
    const blob = await response.blob();
    const contentType = blob.type || inferredType;
    formData.append("file", blob, `voice-note-${turnId}.${inferExtension(contentType)}`);
    return;
  }

  formData.append("file", {
    uri,
    name: fileName,
    type: inferredType,
  } as unknown as Blob);
}

export async function createAudioTurn(
  threadId: string,
  request: ChatAudioTurnCreateRequest,
): Promise<ChatAudioTurnCreateResponse> {
  const formData = new FormData();

  await appendAudioFile(formData, request.uri, request.turn_id);
  formData.append("turn_id", request.turn_id);
  formData.append("language", request.language ?? "es");

  if (request.recording_id) {
    formData.append("recording_id", request.recording_id);
  }

  return postFormData<ChatAudioTurnCreateResponse>(
    `/chat/threads/${threadId}/audio-turns`,
    formData,
  );
}

export function streamTurnEvents(
  turnId: string,
  onEvent: (event: SSETypedEvent) => void,
  afterEventId?: string,
  onDone?: () => void,
  onError?: (error: Error) => void,
): SSEConnection {
  return connectSSE(`/chat/turns/${turnId}/events`, {
    onEvent,
    afterEventId,
    onDone,
    onError,
  });
}
