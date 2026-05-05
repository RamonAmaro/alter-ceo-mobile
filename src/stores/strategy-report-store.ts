import { create } from "zustand";

import { storage } from "@/lib/storage";
import { createPersistDebouncer } from "@/services/persist-debounce-service";
import { getReportTemplate } from "@/services/report-service";
import type { ReportTemplate } from "@/types/report";
import { toErrorMessage } from "@/utils/to-error-message";

export type StrategyReportAnswer = string | string[];

const STRATEGY_DRAFT_STORAGE_PREFIX = "strategy_report_draft_v1:";
const DRAFT_DEBOUNCE_MS = 400;

interface PersistedStrategyDraft {
  reportType: string | null;
  currentQuestionIndex: number;
  answers: Record<string, StrategyReportAnswer>;
  runId: string | null;
}

interface StrategyDraftPayload {
  readonly userId: string;
  readonly draft: PersistedStrategyDraft;
}

function strategyDraftKey(userId: string): string {
  return `${STRATEGY_DRAFT_STORAGE_PREFIX}${userId}`;
}

async function persistStrategyDraft(userId: string, draft: PersistedStrategyDraft): Promise<void> {
  await storage.setJSON(strategyDraftKey(userId), draft);
}

async function clearPersistedStrategyDraft(userId: string): Promise<void> {
  await storage.remove(strategyDraftKey(userId));
}

interface StrategyReportState {
  reportType: string | null;
  template: ReportTemplate | null;
  currentQuestionIndex: number;
  answers: Record<string, StrategyReportAnswer>;
  runId: string | null;
  generatedReport: Record<string, unknown> | null;
  isLoading: boolean;
  error: string | null;
  draftUserId: string | null;

  beginDraft: (userId: string, reportType: string) => void;
  loadTemplate: (reportType: string) => Promise<void>;
  setAnswer: (key: string, answer: StrategyReportAnswer) => void;
  setRunId: (runId: string | null) => void;
  setGeneratedReport: (report: Record<string, unknown> | null) => void;
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

const strategyDebouncer = createPersistDebouncer<StrategyDraftPayload | null>(async (payload) => {
  if (!payload) return;
  await persistStrategyDraft(payload.userId, payload.draft);
}, DRAFT_DEBOUNCE_MS);

function buildStrategyDraftPayload(state: StrategyReportState): StrategyDraftPayload | null {
  if (!state.draftUserId) return null;
  return {
    userId: state.draftUserId,
    draft: {
      reportType: state.reportType,
      currentQuestionIndex: state.currentQuestionIndex,
      answers: state.answers,
      runId: state.runId,
    },
  };
}

function scheduleStrategyPersist(getState: () => StrategyReportState): void {
  strategyDebouncer.schedule(() => buildStrategyDraftPayload(getState()));
}

function cancelScheduledStrategyPersist(): void {
  strategyDebouncer.cancel();
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
    if (current.isLoading && current.reportType === reportType) return;
    if (current.template && current.reportType === reportType) {
      if (current.error) set({ error: null });
      return;
    }

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
      // Backend `prefilled` keys must travel in the final submission (answers
      // model has extra="forbid"); hydrate them upfront.
      const hydratedAnswers: Record<string, StrategyReportAnswer> = {
        ...(shouldPreserveDraft ? current.answers : {}),
      };
      for (const field of template.prefilled ?? []) {
        if (hydratedAnswers[field.key] !== undefined) continue;
        if (Array.isArray(field.value)) {
          hydratedAnswers[field.key] = field.value.map(String);
        } else if (field.value !== null && field.value !== undefined) {
          hydratedAnswers[field.key] = String(field.value);
        }
      }
      set({
        reportType,
        template,
        answers: hydratedAnswers,
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

  setGeneratedReport: (generatedReport: Record<string, unknown> | null) => {
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
    const parsed = await storage.getJSON<PersistedStrategyDraft>(strategyDraftKey(userId));
    if (!parsed || typeof parsed !== "object") return false;
    const answers =
      parsed.answers && typeof parsed.answers === "object" && !Array.isArray(parsed.answers)
        ? parsed.answers
        : {};
    set({
      reportType: parsed.reportType ?? null,
      currentQuestionIndex:
        typeof parsed.currentQuestionIndex === "number" ? parsed.currentQuestionIndex : 0,
      answers,
      runId: parsed.runId ?? null,
      draftUserId: userId,
    });
    return Boolean(parsed.reportType);
  },

  // Persisted draft is intentionally kept; `discardDraft` is the only path that purges it.
  reset: () => {
    cancelScheduledStrategyPersist();
    set(buildEmptyState());
  },

  resetKeepingDraft: () => {
    set({ isLoading: false, error: null, template: null, generatedReport: null });
  },

  discardDraft: () => {
    cancelScheduledStrategyPersist();
    const userId = get().draftUserId;
    set(buildEmptyState());
    if (userId) void clearPersistedStrategyDraft(userId);
  },
}));
