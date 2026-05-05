/**
 * Stream de eventos SSE de tasks com reconnect/backoff.
 *
 * Tirado do task-store para respeitar a regra
 * .claude/rules/state-management.md (stores não devem conter setTimeout/SSE).
 *
 * Uso:
 *   const handle = startTaskEventStream({
 *     onTaskUpsert: (task) => store.upsert(task),
 *   });
 *   ...
 *   handle.stop();
 */

import { streamUserEvents } from "@/services/business-entity-service";
import type { UserSSETypedEvent } from "@/types/sse";
import type { Task, TaskProposalCreatedEvent, TaskProposalResolvedEvent } from "@/types/task";

const RECONNECT_INITIAL_MS = 3000;
const RECONNECT_MAX_MS = 60000;

interface SseConnection {
  readonly abort: () => void;
}

export interface TaskEventStreamHandle {
  readonly stop: () => void;
}

interface StartOptions {
  readonly onTaskUpsert: (task: Task) => void;
}

function safeParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function dispatchEvent(event: UserSSETypedEvent, onTaskUpsert: (task: Task) => void): void {
  if (event.event === "task_proposal_created") {
    const payload = safeParse<TaskProposalCreatedEvent>(event.data);
    if (payload?.task) onTaskUpsert(payload.task);
    return;
  }
  if (event.event === "task_proposal_resolved") {
    const payload = safeParse<TaskProposalResolvedEvent>(event.data);
    if (payload?.task) onTaskUpsert(payload.task);
  }
}

export function startTaskEventStream({ onTaskUpsert }: StartOptions): TaskEventStreamHandle {
  let stopped = false;
  let connection: SseConnection | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let backoffMs = RECONNECT_INITIAL_MS;

  function clearReconnectTimer(): void {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  function scheduleReconnect(): void {
    if (stopped) return;
    const delay = backoffMs;
    backoffMs = Math.min(backoffMs * 2, RECONNECT_MAX_MS);
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      if (stopped) return;
      connect();
    }, delay);
  }

  function connect(): void {
    if (stopped) return;
    let receivedAnyEvent = false;
    connection = streamUserEvents(
      (event) => {
        if (stopped) return;
        if (!receivedAnyEvent) {
          receivedAnyEvent = true;
          backoffMs = RECONNECT_INITIAL_MS;
        }
        dispatchEvent(event, onTaskUpsert);
      },
      () => {
        if (stopped) return;
        connection = null;
        scheduleReconnect();
      },
      () => {
        if (stopped) return;
        connection = null;
        scheduleReconnect();
      },
    );
  }

  connect();

  return {
    stop: () => {
      stopped = true;
      clearReconnectTimer();
      connection?.abort();
      connection = null;
    },
  };
}
