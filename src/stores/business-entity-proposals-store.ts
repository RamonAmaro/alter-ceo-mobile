import { create } from "zustand";

import * as service from "@/services/business-entity-service";
import type {
  BusinessEntity,
  EntityDecision,
  EntityPayload,
  EntityProposalCreatedEvent,
  EntityProposalResolvedEvent,
  EntityStatus,
} from "@/types/business-entity";
import { toErrorMessage } from "@/utils/to-error-message";

export type ProposalSubmissionState = "idle" | "submitting" | "error";

export interface ProposalEntry {
  readonly entityId: string;
  readonly status: EntityStatus;
  readonly payload: EntityPayload;
  readonly submission: ProposalSubmissionState;
  readonly errorMessage: string | null;
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
}

interface ProposalsState {
  readonly proposals: Record<string, ProposalEntry>;
  readonly order: string[];

  hydrate: () => Promise<void>;
  applyCreatedEvent: (event: EntityProposalCreatedEvent) => void;
  applyResolvedEvent: (event: EntityProposalResolvedEvent) => void;
  confirm: (entityId: string) => Promise<void>;
  reject: (entityId: string) => Promise<void>;
  removeProposal: (entityId: string) => void;
  reset: () => void;
}

function entryFromEntity(entity: BusinessEntity): ProposalEntry {
  return {
    entityId: entity.entity_id,
    status: entity.status,
    payload: entity.payload,
    submission: "idle",
    errorMessage: null,
    createdAt: entity.created_at ?? null,
    updatedAt: entity.updated_at ?? null,
  };
}

function entryFromCreatedEvent(event: EntityProposalCreatedEvent): ProposalEntry {
  return {
    entityId: event.entity_id,
    status: event.status,
    payload: event.payload,
    submission: "idle",
    errorMessage: null,
    createdAt: null,
    updatedAt: null,
  };
}

export const useBusinessEntityProposalsStore = create<ProposalsState>((set, get) => {
  const decide = async (entityId: string, decision: EntityDecision): Promise<void> => {
    const entry = get().proposals[entityId];
    if (!entry || entry.submission === "submitting") return;

    set((state) => ({
      proposals: {
        ...state.proposals,
        [entityId]: { ...entry, submission: "submitting", errorMessage: null },
      },
      order: state.order,
    }));

    try {
      const result = await service.decideBusinessEntity(entityId, { decision });
      set((state) => {
        const current = state.proposals[entityId];
        if (!current) return state;
        return {
          proposals: {
            ...state.proposals,
            [entityId]: {
              ...current,
              status: result.status,
              payload: result.payload,
              submission: "idle",
              errorMessage: null,
              updatedAt: result.updated_at ?? current.updatedAt,
            },
          },
          order: state.order,
        };
      });
    } catch (err) {
      set((state) => {
        const current = state.proposals[entityId];
        if (!current) return state;
        return {
          proposals: {
            ...state.proposals,
            [entityId]: {
              ...current,
              submission: "error",
              errorMessage: toErrorMessage(err),
            },
          },
          order: state.order,
        };
      });
    }
  };

  return {
    proposals: {},
    order: [],

    hydrate: async () => {
      try {
        const response = await service.listBusinessEntities({
          status: "proposed",
          entityType: "kpi",
          limit: 50,
        });

        const items = response.items ?? [];
        const next: Record<string, ProposalEntry> = {};
        const nextOrder: string[] = [];

        for (const entity of items) {
          next[entity.entity_id] = entryFromEntity(entity);
          nextOrder.push(entity.entity_id);
        }

        set({ proposals: next, order: nextOrder });
      } catch {
        // Silencioso — o stream SSE eventualmente entrega as propostas novas.
      }
    },

    applyCreatedEvent: (event) => {
      set((state) => {
        const existing = state.proposals[event.entity_id];
        if (existing) {
          const next: ProposalEntry = {
            ...existing,
            status: event.status,
            payload: event.payload,
          };
          return {
            proposals: { ...state.proposals, [event.entity_id]: next },
            order: state.order,
          };
        }

        const fresh = entryFromCreatedEvent(event);
        return {
          proposals: { ...state.proposals, [event.entity_id]: fresh },
          order: [event.entity_id, ...state.order],
        };
      });
    },

    applyResolvedEvent: (event) => {
      set((state) => {
        const existing = state.proposals[event.entity_id];
        if (!existing) return state;

        const next: ProposalEntry = {
          ...existing,
          status: event.status,
          updatedAt: event.updated_at,
          submission: "idle",
          errorMessage: null,
        };
        return {
          proposals: { ...state.proposals, [event.entity_id]: next },
          order: state.order,
        };
      });
    },

    confirm: (entityId) => decide(entityId, "confirm"),
    reject: (entityId) => decide(entityId, "reject"),

    removeProposal: (entityId) => {
      set((state) => {
        if (!state.proposals[entityId]) return state;
        const nextProposals = { ...state.proposals };
        delete nextProposals[entityId];
        return {
          proposals: nextProposals,
          order: state.order.filter((id) => id !== entityId),
        };
      });
    },

    reset: () => {
      set({ proposals: {}, order: [] });
    },
  };
});
