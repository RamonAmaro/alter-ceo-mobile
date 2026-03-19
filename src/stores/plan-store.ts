import { create } from "zustand";
import type { RunStatus } from "@/types/api";
import type {
  PlanRunCreateRequest,
  PlanRunStatusResponse,
  UserLatestPlanResponse,
} from "@/types/plan";
import * as planService from "@/services/plan-service";

const POLL_INTERVAL = 3_000;

interface PlanState {
  currentRun: { run_id: string; status: RunStatus } | null;
  latestPlan: UserLatestPlanResponse | null;
  isGenerating: boolean;
  streamingContent: string;
  error: string | null;

  startPlanGeneration: (request: PlanRunCreateRequest) => Promise<void>;
  pollRunStatus: (runId: string) => void;
  fetchLatestPlan: (userId: string) => Promise<void>;
  reset: () => void;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  currentRun: null,
  latestPlan: null,
  isGenerating: false,
  streamingContent: "",
  error: null,

  startPlanGeneration: async (request: PlanRunCreateRequest) => {
    set({ isGenerating: true, error: null, streamingContent: "" });
    try {
      const accepted = await planService.createRun(request);
      set({ currentRun: accepted });
      get().pollRunStatus(accepted.run_id);
    } catch (err) {
      set({
        isGenerating: false,
        error: (err as Error).message,
      });
    }
  },

  pollRunStatus: (runId: string) => {
    const poll = async (): Promise<void> => {
      try {
        const status: PlanRunStatusResponse =
          await planService.getRunStatus(runId);
        set({ currentRun: { run_id: runId, status: status.status } });

        if (status.status === "COMPLETED" || status.status === "FAILED") {
          set({
            isGenerating: false,
            error:
              status.status === "FAILED"
                ? status.error_message ?? "Error al generar el plan"
                : null,
          });
          return;
        }

        setTimeout(poll, POLL_INTERVAL);
      } catch (err) {
        set({
          isGenerating: false,
          error: (err as Error).message,
        });
      }
    };

    poll();
  },

  fetchLatestPlan: async (userId: string) => {
    try {
      const plan = await planService.getLatestUserPlan(userId);
      set({ latestPlan: plan });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  reset: () => {
    set({
      currentRun: null,
      latestPlan: null,
      isGenerating: false,
      streamingContent: "",
      error: null,
    });
  },
}));
