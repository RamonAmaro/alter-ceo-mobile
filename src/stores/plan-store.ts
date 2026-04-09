import { create } from "zustand";
import type { RunStatus } from "@/types/api";
import type { PlanRunCreateRequest, UserLatestPlanResponse } from "@/types/plan";
import * as planService from "@/services/plan-service";
import { toErrorMessage } from "@/utils/to-error-message";

interface PlanState {
  currentRun: { run_id: string; status: RunStatus } | null;
  latestPlan: UserLatestPlanResponse | null;
  isGenerating: boolean;
  streamingContent: string;
  error: string | null;
  _activePoller: { stop: () => void } | null;

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
  _activePoller: null,

  startPlanGeneration: async (request: PlanRunCreateRequest) => {
    set({ isGenerating: true, error: null, streamingContent: "" });
    try {
      const accepted = await planService.createRun(request);
      set({ currentRun: accepted });
      get().pollRunStatus(accepted.run_id);
    } catch (err) {
      set({
        isGenerating: false,
        error: toErrorMessage(err),
      });
    }
  },

  pollRunStatus: (runId: string) => {
    get()._activePoller?.stop();
    const poller = planService.pollRunUntilDone(
      runId,
      (status) => {
        set({ currentRun: { run_id: runId, status: status.status } });
        if (status.status === "COMPLETED" || status.status === "FAILED") {
          set({
            isGenerating: false,
            _activePoller: null,
            error:
              status.status === "FAILED"
                ? (status.error_message ?? "Error al generar el plan")
                : null,
          });
        }
      },
      (err) => set({ isGenerating: false, _activePoller: null, error: toErrorMessage(err) }),
    );
    set({ _activePoller: poller });
    poller.start();
  },

  fetchLatestPlan: async (userId: string) => {
    try {
      const plan = await planService.getLatestUserPlan(userId);
      set({ latestPlan: plan });
    } catch (err) {
      set({ error: toErrorMessage(err) });
    }
  },

  reset: () => {
    get()._activePoller?.stop();
    set({
      currentRun: null,
      latestPlan: null,
      isGenerating: false,
      streamingContent: "",
      error: null,
      _activePoller: null,
    });
  },
}));
