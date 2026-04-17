import { create } from "zustand";

import { getReportTemplate } from "@/services/report-service";
import type { Captacion5FasesReport, ReportTemplate } from "@/types/report";
import { toErrorMessage } from "@/utils/to-error-message";

export type StrategyReportAnswer = string | string[];

interface StrategyReportState {
  reportType: string | null;
  template: ReportTemplate | null;
  currentQuestionIndex: number;
  answers: Record<string, StrategyReportAnswer>;
  runId: string | null;
  generatedReport: Captacion5FasesReport | null;
  isLoading: boolean;
  error: string | null;

  beginDraft: (reportType: string) => void;
  loadTemplate: (reportType: string) => Promise<void>;
  setAnswer: (key: string, answer: StrategyReportAnswer) => void;
  setRunId: (runId: string | null) => void;
  setGeneratedReport: (report: Captacion5FasesReport | null) => void;
  setError: (error: string | null) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  setCurrentQuestionIndex: (index: number) => void;
  reset: () => void;
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
  };
}

export const useStrategyReportStore = create<StrategyReportState>((set, get) => ({
  ...buildEmptyState(),

  beginDraft: (reportType: string) => {
    set({
      ...buildEmptyState(),
      reportType,
    });
  },

  loadTemplate: async (reportType: string) => {
    const current = get();
    if (current.template && current.reportType === reportType) {
      if (current.error) set({ error: null });
      return;
    }

    set({
      reportType,
      template: null,
      isLoading: true,
      error: null,
      currentQuestionIndex: 0,
      answers: {},
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
  },

  setRunId: (runId: string | null) => {
    set({ runId });
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
  },

  previousQuestion: () => {
    set((state) => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    }));
  },

  setCurrentQuestionIndex: (index: number) => {
    set({ currentQuestionIndex: Math.max(index, 0) });
  },

  reset: () => {
    set(buildEmptyState());
  },
}));
