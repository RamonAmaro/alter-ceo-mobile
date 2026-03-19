import { create } from "zustand";
import type { RunStatus } from "@/types/api";
import type {
  PlanRunCreateRequest,
  PlanRunStatusResponse,
  UserLatestPlanResponse,
} from "@/types/plan";
import * as planService from "@/services/plan-service";
import { createPoller } from "@/utils/create-poller";
import { POLL_INTERVAL } from "@/constants/api";

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
    const poller = createPoller<PlanRunStatusResponse>({
      fn: () => planService.getRunStatus(runId),
      interval: POLL_INTERVAL,
      shouldStop: (status) =>
        status.status === "COMPLETED" || status.status === "FAILED",
      onUpdate: (status) => {
        set({ currentRun: { run_id: runId, status: status.status } });
        if (status.status === "COMPLETED" || status.status === "FAILED") {
          set({
            isGenerating: false,
            error:
              status.status === "FAILED"
                ? status.error_message ?? "Error al generar el plan"
                : null,
          });
        }
      },
      onError: (err) => {
        set({
          isGenerating: false,
          error: (err as Error).message,
        });
      },
    });

    poller.start();
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
