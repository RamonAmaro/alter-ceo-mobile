import type { RunStatus } from "./api";

export type ChatRole = "user" | "assistant";

export interface ChatThreadResponse {
  thread_id: string;
  user_id: string;
  created_at: string;
}

export interface ChatThreadSummary {
  thread_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserChatThreadsResponse {
  user_id: string;
  threads?: ChatThreadSummary[];
}

export type MessageKind = "assistant_gap_prompt";

export interface ChatMessageResponse {
  id: string;
  thread_id: string;
  role: ChatRole;
  text: string;
  created_at: string;
  message_kind?: MessageKind;
}

export interface ChatMessagesResponse {
  thread_id: string;
  messages?: ChatMessageResponse[];
}

export interface ChatTurnCreateRequest {
  turn_id: string;
  message: string;
}

export interface ChatTurnCreateResponse {
  turn_id: string;
  thread_id: string;
  status: RunStatus;
  user_message_id: string;
}
