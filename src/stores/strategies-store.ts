import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { listReports, getReportRunStatus } from "@/services/report-service";
import type { ReportSummary, ReportRunStatusResponse } from "@/types/report";
import type { RunStatus } from "@/types/api";
import { toErrorMessage } from "@/utils/to-error-message";

const PENDING_RUNS_STORAGE_PREFIX = "strategies_pending_runs_v1:";

export interface PendingStrategyRun {
  runId: string;
  reportType: string;
  startedAt: string;
  status: RunStatus;
  errorMessage?: string | null;
}

const REPORTS_PAGE_SIZE = 20;

interface StrategiesState {
  reports: ReportSummary[];
  pendingRuns: PendingStrategyRun[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  trackedUserId: string | null;
  nextCursor: string | null;

  fetchReports: () => Promise<void>;
  fetchMoreReports: () => Promise<void>;
  trackPendingRun: (userId: string, runId: string, reportType: string) => Promise<void>;
  refreshPendingRuns: () => Promise<void>;
  hydratePendingRuns: (userId: string) => Promise<void>;
  reset: () => void;
}

function pendingRunsKey(userId: string): string {
  return `${PENDING_RUNS_STORAGE_PREFIX}${userId}`;
}

async function persistPendingRuns(userId: string, runs: PendingStrategyRun[]): Promise<void> {
  try {
    await AsyncStorage.setItem(pendingRunsKey(userId), JSON.stringify(runs));
  } catch {
    // best-effort
  }
}

async function loadPendingRuns(userId: string): Promise<PendingStrategyRun[]> {
  try {
    const raw = await AsyncStorage.getItem(pendingRunsKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PendingStrategyRun[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildEmptyState() {
  return {
    reports: [] as ReportSummary[],
    pendingRuns: [] as PendingStrategyRun[],
    isLoading: false,
    isLoadingMore: false,
    error: null,
    trackedUserId: null,
    nextCursor: null as string | null,
  };
}

function isTerminalStatus(status: RunStatus): boolean {
  return status === "COMPLETED" || status === "FAILED";
}

export const useStrategiesStore = create<StrategiesState>((set, get) => ({
  ...buildEmptyState(),

  fetchReports: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await listReports({ limit: REPORTS_PAGE_SIZE });
      set({
        reports: response.items,
        nextCursor: response.next_cursor ?? null,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: toErrorMessage(err) });
    }
  },

  fetchMoreReports: async () => {
    const { isLoadingMore, isLoading, nextCursor } = get();
    if (isLoadingMore || isLoading || !nextCursor) return;

    set({ isLoadingMore: true });
    try {
      const response = await listReports({ limit: REPORTS_PAGE_SIZE, cursor: nextCursor });
      const existingIds = new Set(get().reports.map((r) => r.report_id));
      const fresh = response.items.filter((r) => !existingIds.has(r.report_id));
      set({
        reports: [...get().reports, ...fresh],
        nextCursor: response.next_cursor ?? null,
        isLoadingMore: false,
      });
    } catch (err) {
      set({ isLoadingMore: false, error: toErrorMessage(err) });
    }
  },

  trackPendingRun: async (userId, runId, reportType) => {
    const current = get().pendingRuns;
    const next: PendingStrategyRun[] = [
      {
        runId,
        reportType,
        startedAt: new Date().toISOString(),
        status: "QUEUED",
      },
      ...current.filter((r) => r.runId !== runId),
    ];
    set({ pendingRuns: next, trackedUserId: userId });
    await persistPendingRuns(userId, next);
  },

  refreshPendingRuns: async () => {
    const { pendingRuns, trackedUserId } = get();
    if (pendingRuns.length === 0) return;

    const updated = await Promise.all(
      pendingRuns.map(async (run): Promise<PendingStrategyRun> => {
        try {
          const status: ReportRunStatusResponse = await getReportRunStatus(run.runId);
          return {
            ...run,
            status: status.status,
            errorMessage: status.error_message ?? null,
          };
        } catch {
          return run;
        }
      }),
    );

    const stillPending = updated.filter((r) => !isTerminalStatus(r.status));
    const completedSomething = updated.some(
      (r) =>
        isTerminalStatus(r.status) &&
        !pendingRuns.find((p) => p.runId === r.runId && isTerminalStatus(p.status)),
    );

    set({ pendingRuns: stillPending });
    if (trackedUserId) await persistPendingRuns(trackedUserId, stillPending);

    if (completedSomething) {
      void get().fetchReports();
    }
  },

  hydratePendingRuns: async (userId) => {
    const persisted = await loadPendingRuns(userId);
    set({ pendingRuns: persisted, trackedUserId: userId });
  },

  reset: () => {
    set(buildEmptyState());
  },
}));
