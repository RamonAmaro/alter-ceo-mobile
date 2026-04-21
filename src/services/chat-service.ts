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

const AUDIO_MIME_BY_EXT = {
  webm: "audio/webm",
  ogg: "audio/ogg",
  wav: "audio/wav",
  mp3: "audio/mp3",
  mpeg: "audio/mpeg",
  mp4: "audio/mp4",
  m4a: "audio/m4a",
  flac: "audio/flac",
  amr: "audio/amr",
  aac: "audio/aac",
} as const satisfies Record<string, string>;

type AudioExt = keyof typeof AUDIO_MIME_BY_EXT;

const DEFAULT_EXT: AudioExt = "m4a";
const DEFAULT_MIME = AUDIO_MIME_BY_EXT[DEFAULT_EXT];

const AUDIO_EXT_BY_MIME: Record<string, AudioExt> = Object.entries(AUDIO_MIME_BY_EXT).reduce(
  (acc, [ext, mime]) => {
    if (!(mime in acc)) acc[mime] = ext as AudioExt;
    return acc;
  },
  {} as Record<string, AudioExt>,
);

function inferContentType(uri: string): string {
  if (uri.startsWith("blob:")) return AUDIO_MIME_BY_EXT.webm;
  const ext = uri.split("?")[0]?.toLowerCase().split(".").pop() ?? "";
  return (AUDIO_MIME_BY_EXT as Record<string, string>)[ext] ?? DEFAULT_MIME;
}

function inferExtension(contentType: string): AudioExt {
  return AUDIO_EXT_BY_MIME[contentType] ?? DEFAULT_EXT;
}

interface RNFilePart {
  readonly uri: string;
  readonly name: string;
  readonly type: string;
}

function appendRNFile(formData: FormData, field: string, file: RNFilePart): void {
  // React Native FormData accepts `{ uri, name, type }` at runtime but the web
  // FormData.append typing only accepts `Blob | string`. Cast is isolated here.
  formData.append(field, file as unknown as Blob);
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

  appendRNFile(formData, "file", { uri, name: fileName, type: inferredType });
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
