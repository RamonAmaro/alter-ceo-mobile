import { get, patch } from "@/lib/api-client";
import { connectSSE, type SSEConnection } from "@/lib/sse-client";
import type {
  BusinessEntitiesListResponse,
  BusinessEntity,
  EntityDecisionRequest,
  EntityStatus,
} from "@/types/business-entity";
import type { UserSSETypedEvent } from "@/types/sse";
import { USER_SSE_EVENT_TYPES } from "@/types/sse";

const USER_EVENT_NAMES: ReadonlySet<string> = new Set<string>(USER_SSE_EVENT_TYPES);

interface ListProposalsParams {
  readonly status?: EntityStatus;
  readonly limit?: number;
}

export async function listBusinessEntities(
  params: ListProposalsParams = {},
): Promise<BusinessEntitiesListResponse> {
  const query: Record<string, string> = {};
  if (params.status) query.status = params.status;
  if (params.limit != null) query.limit = String(params.limit);
  return get<BusinessEntitiesListResponse>("/business-entities", query);
}

export async function decideBusinessEntity(
  entityId: string,
  request: EntityDecisionRequest,
): Promise<BusinessEntity> {
  return patch<BusinessEntity>(`/business-entities/${entityId}`, request);
}

function isUserEventName(name: string): name is UserSSETypedEvent["event"] {
  return USER_EVENT_NAMES.has(name);
}

export function streamUserEvents(
  onEvent: (event: UserSSETypedEvent) => void,
  onError?: (error: Error) => void,
  onDone?: () => void,
): SSEConnection {
  return connectSSE("/users/me/events", {
    onEvent: (event) => {
      if (!isUserEventName(event.event)) return;
      onEvent({ id: event.id, event: event.event, data: event.data });
    },
    onError,
    onDone,
    allowedEvents: USER_EVENT_NAMES,
  });
}
