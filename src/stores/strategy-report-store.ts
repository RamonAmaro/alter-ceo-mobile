import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { getReportTemplate } from "@/services/report-service";
import type { Captacion5FasesReport, ReportTemplate } from "@/types/report";
import { toErrorMessage } from "@/utils/to-error-message";

export type StrategyReportAnswer = string | string[];

// Strategy questionnaire draft: preserved across 401 so the user does not lose
// the questionnaire state if the session expires mid-flow.
const STRATEGY_DRAFT_STORAGE_PREFIX = "strategy_report_draft_v1:";
const DRAFT_DEBOUNCE_MS = 400;

interface PersistedStrategyDraft {
  reportType: string | null;
  currentQuestionIndex: number;
  answers: Record<string, StrategyReportAnswer>;
  runId: string | null;
}

let draftPersistTimer: ReturnType<typeof setTimeout> | null = null;

function strategyDraftKey(userId: string): string {
  return `${STRATEGY_DRAFT_STORAGE_PREFIX}${userId}`;
}

async function persistStrategyDraft(userId: string, draft: PersistedStrategyDraft): Promise<void> {
  try {
    await AsyncStorage.setItem(strategyDraftKey(userId), JSON.stringify(draft));
  } catch {
    // best-effort
  }
}

async function clearPersistedStrategyDraft(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(strategyDraftKey(userId));
  } catch {
    // best-effort
  }
}

interface StrategyReportState {
  reportType: string | null;
  template: ReportTemplate | null;
  currentQuestionIndex: number;
  answers: Record<string, StrategyReportAnswer>;
  runId: string | null;
  generatedReport: Captacion5FasesReport | null;
  isLoading: boolean;
  error: string | null;
  draftUserId: string | null;

  beginDraft: (userId: string, reportType: string) => void;
  loadTemplate: (reportType: string) => Promise<void>;
  setAnswer: (key: string, answer: StrategyReportAnswer) => void;
  setRunId: (runId: string | null) => void;
  setGeneratedReport: (report: Captacion5FasesReport | null) => void;
  setError: (error: string | null) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  setCurrentQuestionIndex: (index: number) => void;
  restoreDraft: (userId: string) => Promise<boolean>;
  reset: () => void;
  resetKeepingDraft: () => void;
  discardDraft: () => void;
}

function buildEmptyState() {
  return {
    reportType: null,
    template: null,
    currentQuestionIndex: 0,
    answers: {} as Record<string, StrategyReportAnswer>,
    runId: null,
    generatedReport: null,
    isLoading: false,
    error: null,
    draftUserId: null,
  };
}

function cancelScheduledStrategyPersist(): void {
  if (draftPersistTimer) {
    clearTimeout(draftPersistTimer);
    draftPersistTimer = null;
  }
}

function scheduleStrategyPersist(getState: () => StrategyReportState): void {
  if (draftPersistTimer) clearTimeout(draftPersistTimer);
  draftPersistTimer = setTimeout(() => {
    draftPersistTimer = null;
    const s = getState();
    if (!s.draftUserId) return;
    void persistStrategyDraft(s.draftUserId, {
      reportType: s.reportType,
      currentQuestionIndex: s.currentQuestionIndex,
      answers: s.answers,
      runId: s.runId,
    });
  }, DRAFT_DEBOUNCE_MS);
}

export const useStrategyReportStore = create<StrategyReportState>((set, get) => ({
  ...buildEmptyState(),

  beginDraft: (userId: string, reportType: string) => {
    set({
      ...buildEmptyState(),
      reportType,
      draftUserId: userId,
    });
    scheduleStrategyPersist(get);
  },

  loadTemplate: async (reportType: string) => {
    const current = get();
    if (current.template && current.reportType === reportType) {
      if (current.error) set({ error: null });
      return;
    }

    // Preserve currentQuestionIndex/answers if they belong to the same reportType
    // (restored from a persisted draft). Only reset them if this is a fresh flow.
    const shouldPreserveDraft = current.reportType === reportType;

    set({
      reportType,
      template: null,
      isLoading: true,
      error: null,
      currentQuestionIndex: shouldPreserveDraft ? current.currentQuestionIndex : 0,
      answers: shouldPreserveDraft ? current.answers : {},
    });

    try {
      const template = await getReportTemplate(reportType);
      set({
        reportType,
        template,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        template: null,
        isLoading: false,
        error: toErrorMessage(error),
      });
    }
  },

  setAnswer: (key: string, answer: StrategyReportAnswer) => {
    set((state) => ({
      answers: {
        ...state.answers,
        [key]: answer,
      },
    }));
    scheduleStrategyPersist(get);
  },

  setRunId: (runId: string | null) => {
    set({ runId });
    scheduleStrategyPersist(get);
  },

  setGeneratedReport: (generatedReport: Captacion5FasesReport | null) => {
    set({ generatedReport });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  nextQuestion: () => {
    set((state) => ({
      currentQuestionIndex: state.currentQuestionIndex + 1,
    }));
    scheduleStrategyPersist(get);
  },

  previousQuestion: () => {
    set((state) => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    }));
    scheduleStrategyPersist(get);
  },

  setCurrentQuestionIndex: (index: number) => {
    set({ currentQuestionIndex: Math.max(index, 0) });
    scheduleStrategyPersist(get);
  },

  restoreDraft: async (userId: string) => {
    try {
      const raw = await AsyncStorage.getItem(strategyDraftKey(userId));
      if (!raw) return false;
      const parsed = JSON.parse(raw) as PersistedStrategyDraft;
      set({
        reportType: parsed.reportType,
        currentQuestionIndex: parsed.currentQuestionIndex ?? 0,
        answers: parsed.answers ?? {},
        runId: parsed.runId ?? null,
        draftUserId: userId,
      });
      return Boolean(parsed.reportType);
    } catch {
      return false;
    }
  },

  // Clears in-memory state but keeps the persisted draft on disk. Used on
  // logout (manual or 401) and account switch — when the user returns, their
  // draft is restored. To actively discard the draft (finished report, user
  // aborts the questionnaire) use `discardDraft` instead.
  reset: () => {
    cancelScheduledStrategyPersist();
    set(buildEmptyState());
  },

  // Preserves the in-memory draft AND the persisted draft; only clears
  // transient loading/error flags. Use on 401 so the user recovers after
  // re-login.
  resetKeepingDraft: () => {
    set({ isLoading: false, error: null, template: null, generatedReport: null });
  },

  // Explicitly discard the draft (user finished the report or abandoned the
  // questionnaire on purpose).
  discardDraft: () => {
    cancelScheduledStrategyPersist();
    const userId = get().draftUserId;
    set(buildEmptyState());
    if (userId) void clearPersistedStrategyDraft(userId);
  },
}));
