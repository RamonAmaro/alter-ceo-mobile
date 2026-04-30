/** SSE event types emitted by the backend for all stream endpoints. */
export const SSE_EVENT_TYPES = [
  "queued",
  "running",
  "report_generating",
  "report_step_started",
  "routing",
  "started",
  "business_kernel",
  "business_kernel_ready",
  "plan_generating",
  "delta",
  "plan_validating",
  "tool_execution",
  "persisting",
  "complete",
  "error",
] as const;

export type SSEEventType = (typeof SSE_EVENT_TYPES)[number];

/** SSE event types emitted on the user-wide channel `/users/me/events`. */
export const USER_SSE_EVENT_TYPES = [
  "entity_proposal_created",
  "entity_proposal_resolved",
  "task_proposal_created",
  "task_proposal_resolved",
] as const;

export type UserSSEEventType = (typeof USER_SSE_EVENT_TYPES)[number];

export interface UserSSETypedEvent {
  readonly id?: string;
  readonly event: UserSSEEventType;
  readonly data: string;
}

/** Parsed SSE payload — data is always the raw JSON string from the `data:` field. */
export interface SSETypedEvent {
  readonly id?: string;
  readonly event: SSEEventType;
  readonly data: string;
}

// ─── Chat-specific event payloads ────────────────────────────────────────────

export interface ChatDeltaPayload {
  readonly turn_id: string;
  readonly text: string;
}

export interface ChatCompletePayload {
  readonly turn_id: string;
  readonly message_kind?: string;
  readonly message: {
    readonly id: string;
    readonly thread_id: string;
    readonly role: "user" | "assistant";
    readonly text: string;
    readonly created_at: string;
    readonly message_kind?: string;
  };
}

export interface ChatStartedPayload {
  readonly turn_id: string;
  readonly thread_id: string;
  readonly user_message_id: string;
}

export interface ChatErrorPayload {
  readonly message?: string;
}
