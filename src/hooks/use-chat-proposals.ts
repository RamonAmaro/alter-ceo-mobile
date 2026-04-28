import { useCallback, useEffect, useRef, useState } from "react";

import * as service from "@/services/business-entity-service";
import type {
  BusinessEntity,
  EntityDecision,
  EntityPayload,
  EntityProposalCreatedEvent,
  EntityProposalResolvedEvent,
  EntityStatus,
  EntityType,
} from "@/types/business-entity";
import type { UserSSETypedEvent } from "@/types/sse";
import { toErrorMessage } from "@/utils/to-error-message";

export type ProposalSubmissionState = "idle" | "submitting" | "error";

export interface ProposalEntry {
  readonly entityId: string;
  readonly status: EntityStatus;
  readonly payload: EntityPayload;
  readonly submission: ProposalSubmissionState;
  readonly errorMessage: string | null;
}

const SUPPORTED_ENTITY_TYPES: ReadonlySet<EntityType> = new Set<EntityType>([
  "kpi",
  "product_service",
  "supplier",
]);

const RECONNECT_INITIAL_MS = 3000;
const RECONNECT_MAX_MS = 60000;

function entryFromEntity(entity: BusinessEntity): ProposalEntry {
  return {
    entityId: entity.entity_id,
    status: entity.status,
    payload: entity.payload,
    submission: "idle",
    errorMessage: null,
  };
}

function entryFromCreatedEvent(event: EntityProposalCreatedEvent): ProposalEntry {
  return {
    entityId: event.entity_id,
    status: event.status,
    payload: event.payload,
    submission: "idle",
    errorMessage: null,
  };
}

function safeParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export interface UseChatProposalsResult {
  readonly proposals: Record<string, ProposalEntry>;
  readonly order: readonly string[];
  readonly isLoading: boolean;
  readonly confirm: (entityId: string) => Promise<void>;
  readonly reject: (entityId: string) => Promise<void>;
  readonly removeProposal: (entityId: string) => void;
}

export function useChatProposals(enabled: boolean): UseChatProposalsResult {
  const [proposals, setProposals] = useState<Record<string, ProposalEntry>>({});
  const [order, setOrder] = useState<readonly string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const proposalsRef = useRef(proposals);
  proposalsRef.current = proposals;

  const applyCreated = useCallback((event: EntityProposalCreatedEvent) => {
    if (!SUPPORTED_ENTITY_TYPES.has(event.entity_type)) return;
    setProposals((current) => {
      const existing = current[event.entity_id];
      if (existing) {
        return {
          ...current,
          [event.entity_id]: { ...existing, status: event.status, payload: event.payload },
        };
      }
      return { ...current, [event.entity_id]: entryFromCreatedEvent(event) };
    });
    setOrder((current) =>
      current.includes(event.entity_id) ? current : [event.entity_id, ...current],
    );
  }, []);

  const applyResolved = useCallback((event: EntityProposalResolvedEvent) => {
    setProposals((current) => {
      const existing = current[event.entity_id];
      if (!existing) return current;
      return {
        ...current,
        [event.entity_id]: {
          ...existing,
          status: event.status,
          submission: "idle",
          errorMessage: null,
        },
      };
    });
  }, []);

  const removeProposal = useCallback((entityId: string) => {
    setProposals((current) => {
      if (!current[entityId]) return current;
      const next = { ...current };
      delete next[entityId];
      return next;
    });
    setOrder((current) => current.filter((id) => id !== entityId));
  }, []);

  const decide = useCallback(async (entityId: string, decision: EntityDecision): Promise<void> => {
    const entry = proposalsRef.current[entityId];
    if (!entry || entry.submission === "submitting") return;

    setProposals((current) => {
      const target = current[entityId];
      if (!target) return current;
      return {
        ...current,
        [entityId]: { ...target, submission: "submitting", errorMessage: null },
      };
    });

    try {
      const result = await service.decideBusinessEntity(entityId, { decision });
      setProposals((current) => {
        const target = current[entityId];
        if (!target) return current;
        return {
          ...current,
          [entityId]: {
            ...target,
            status: result.status,
            payload: result.payload,
            submission: "idle",
            errorMessage: null,
          },
        };
      });
    } catch (err) {
      setProposals((current) => {
        const target = current[entityId];
        if (!target) return current;
        return {
          ...current,
          [entityId]: {
            ...target,
            submission: "error",
            errorMessage: toErrorMessage(err),
          },
        };
      });
    }
  }, []);

  const confirm = useCallback((entityId: string) => decide(entityId, "confirm"), [decide]);
  const reject = useCallback((entityId: string) => decide(entityId, "reject"), [decide]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let connection: { abort: () => void } | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let backoffMs = RECONNECT_INITIAL_MS;
    let receivedAnyEvent = false;

    const fetchInitial = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const response = await service.listBusinessEntities({
          status: "proposed",
          limit: 50,
        });
        if (cancelled) return;

        const items = response.items ?? [];
        const next: Record<string, ProposalEntry> = {};
        const nextOrder: string[] = [];
        for (const entity of items) {
          next[entity.entity_id] = entryFromEntity(entity);
          nextOrder.push(entity.entity_id);
        }
        setProposals(next);
        setOrder(nextOrder);
      } catch {
        // Silencioso — o stream SSE eventualmente entrega as propostas novas.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    const handleEvent = (event: UserSSETypedEvent): void => {
      if (event.event === "entity_proposal_created") {
        const payload = safeParse<EntityProposalCreatedEvent>(event.data);
        if (payload) applyCreated(payload);
        return;
      }
      if (event.event === "entity_proposal_resolved") {
        const payload = safeParse<EntityProposalResolvedEvent>(event.data);
        if (payload) applyResolved(payload);
      }
    };

    const scheduleReconnect = (): void => {
      if (cancelled) return;
      const delay = backoffMs;
      backoffMs = Math.min(backoffMs * 2, RECONNECT_MAX_MS);
      reconnectTimer = setTimeout(() => {
        if (cancelled) return;
        connect();
      }, delay);
    };

    const connect = (): void => {
      if (cancelled) return;
      receivedAnyEvent = false;
      connection = service.streamUserEvents(
        (event) => {
          if (cancelled) return;
          if (!receivedAnyEvent) {
            receivedAnyEvent = true;
            backoffMs = RECONNECT_INITIAL_MS;
          }
          handleEvent(event);
        },
        () => {
          if (cancelled) return;
          scheduleReconnect();
        },
        () => {
          if (cancelled) return;
          scheduleReconnect();
        },
      );
    };

    void fetchInitial();
    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      connection?.abort();
    };
  }, [enabled, applyCreated, applyResolved]);

  return {
    proposals,
    order,
    isLoading,
    confirm,
    reject,
    removeProposal,
  };
}
