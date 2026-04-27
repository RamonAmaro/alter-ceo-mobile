import { useEffect } from "react";

import * as service from "@/services/business-entity-service";
import { useBusinessEntityProposalsStore } from "@/stores/business-entity-proposals-store";
import type {
  EntityProposalCreatedEvent,
  EntityProposalResolvedEvent,
} from "@/types/business-entity";
import type { UserSSETypedEvent } from "@/types/sse";

const RECONNECT_INITIAL_MS = 3000;
const RECONNECT_MAX_MS = 60000;

function safeParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function handleEvent(event: UserSSETypedEvent): void {
  const store = useBusinessEntityProposalsStore.getState();
  if (event.event === "entity_proposal_created") {
    const payload = safeParse<EntityProposalCreatedEvent>(event.data);
    if (payload && payload.entity_type === "kpi") {
      store.applyCreatedEvent(payload);
    }
    return;
  }
  if (event.event === "entity_proposal_resolved") {
    const payload = safeParse<EntityProposalResolvedEvent>(event.data);
    if (payload) {
      store.applyResolvedEvent(payload);
    }
  }
}

/**
 * Mantém uma conexão SSE viva com /users/me/events enquanto `isAuthenticated`
 * for true. Reconecta com backoff exponencial em caso de erro (3s → 60s),
 * resetando o backoff apenas após receber ao menos um evento. Refaz o hydrate
 * de propostas pendentes na primeira conexão e depois apenas em reconexões
 * que sigam uma sessão bem-sucedida — evitando bombardear o backend com
 * GETs enquanto o endpoint estiver indisponível.
 */
export function useUserEventsStream(isAuthenticated: boolean): void {
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    let connection: { abort: () => void } | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let backoffMs = RECONNECT_INITIAL_MS;
    let receivedAnyEvent = false;
    let didInitialHydrate = false;

    const runHydrate = (): void => {
      void useBusinessEntityProposalsStore.getState().hydrate();
    };

    const scheduleReconnect = (shouldHydrate: boolean): void => {
      if (cancelled) return;
      const delay = backoffMs;
      backoffMs = Math.min(backoffMs * 2, RECONNECT_MAX_MS);

      reconnectTimer = setTimeout(() => {
        if (cancelled) return;
        if (shouldHydrate) runHydrate();
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
          // Só refaz o hydrate em reconexões que seguem uma sessão produtiva,
          // para não martelar o backend quando o endpoint estiver fora.
          scheduleReconnect(receivedAnyEvent);
        },
        () => {
          if (cancelled) return;
          scheduleReconnect(receivedAnyEvent);
        },
      );
    };

    if (!didInitialHydrate) {
      didInitialHydrate = true;
      runHydrate();
    }
    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      connection?.abort();
    };
  }, [isAuthenticated]);
}
