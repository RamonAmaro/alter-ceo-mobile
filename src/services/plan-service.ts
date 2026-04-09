import { get, post } from "@/lib/api-client";
import { connectSSE, type SSEConnection } from "@/lib/sse-client";
import { createPoller } from "@/utils/create-poller";
import { POLL_INTERVAL } from "@/constants/env";
import type { SSETypedEvent } from "@/types/sse";
import type {
  PlanRunAccepted,
  PlanRunCreateRequest,
  PlanRunStatusResponse,
  PlanUpsertRequest,
  PlanUpsertResponse,
  UserLatestPlanResponse,
} from "@/types/plan";

export async function createRun(request: PlanRunCreateRequest): Promise<PlanRunAccepted> {
  return post<PlanRunAccepted>("/runs", request);
}

export async function getRunStatus(runId: string): Promise<PlanRunStatusResponse> {
  return get<PlanRunStatusResponse>(`/runs/${runId}`);
}

export function streamRunEvents(
  runId: string,
  onEvent: (event: SSETypedEvent) => void,
  onError?: (error: Error) => void,
  afterEventId?: string,
): SSEConnection {
  return connectSSE(`/runs/${runId}/events`, { onEvent, onError, afterEventId });
}

export function streamPlan(
  request: PlanRunCreateRequest,
  onEvent: (event: SSETypedEvent) => void,
): SSEConnection {
  return connectSSE("/plans/stream", {
    onEvent,
    method: "POST",
    body: request,
  });
}

export async function upsertPlan(request: PlanUpsertRequest): Promise<PlanUpsertResponse> {
  return post<PlanUpsertResponse>("/plans", request);
}

export async function getLatestUserPlan(userId: string): Promise<UserLatestPlanResponse> {
  return get<UserLatestPlanResponse>(`/users/${userId}/plan`);
}

export function pollRunUntilDone(
  runId: string,
  onUpdate: (status: PlanRunStatusResponse) => void,
  onError: (err: unknown) => void,
): { start: () => void; stop: () => void } {
  return createPoller<PlanRunStatusResponse>({
    fn: () => getRunStatus(runId),
    interval: POLL_INTERVAL,
    shouldStop: (status) => status.status === "COMPLETED" || status.status === "FAILED",
    onUpdate,
    onError,
  });
}
