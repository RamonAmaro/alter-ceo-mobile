import { create } from "zustand";

import { getBusinessKernel } from "@/services/business-kernel-service";
import { ApiError } from "@/types/api";
import { toErrorMessage } from "@/utils/to-error-message";

type PlanType = "express" | "professional";

export type Answer = string | string[];

export interface AudioRecord {
  uri: string;
  origin: PlanType;
  questionIndex: number;
  question: string;
  transcript: string | null;
}

interface OnboardingState {
  completed: boolean;
  error: string | null;
  planType: PlanType | null;
  isLoading: boolean;
  statusUserId: string | null;
  currentQuestionIndex: number;
  answers: Map<number, Answer>;
  audioRecords: AudioRecord[];

  load: () => Promise<void>;
  resolveCompletionStatus: (userId: string) => Promise<void>;
  markCompletedForUser: (userId: string) => void;
  setPlanType: (type: PlanType) => void;
  getAnswer: (index: number) => Answer | undefined;
  setAnswer: (index: number, answer: Answer) => void;
  setAnswers: (answers: Map<number, Answer>) => void;
  addAudioRecord: (record: AudioRecord) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  setCurrentQuestionIndex: (index: number) => void;
  upgradeToProfessional: () => void;
  clearAnswers: () => void;
  resetSession: () => void;
  reset: () => Promise<void>;
}

function buildEmptyDraftState() {
  return {
    planType: null,
    currentQuestionIndex: 0,
    answers: new Map<number, Answer>(),
    audioRecords: [] as AudioRecord[],
  };
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  completed: false,
  error: null,
  isLoading: true,
  statusUserId: null,
  ...buildEmptyDraftState(),

  load: async () => {
    set({
      completed: false,
      error: null,
      isLoading: false,
      statusUserId: null,
    });
  },

  resolveCompletionStatus: async (userId: string) => {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      set({
        completed: false,
        error: "Sesión no válida.",
        isLoading: false,
        statusUserId: null,
      });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await getBusinessKernel(normalizedUserId);
      set({
        completed: true,
        error: null,
        isLoading: false,
        statusUserId: normalizedUserId,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        set({
          completed: false,
          error: null,
          isLoading: false,
          statusUserId: normalizedUserId,
        });
        return;
      }

      set({
        completed: false,
        error: toErrorMessage(err),
        isLoading: false,
        statusUserId: normalizedUserId,
      });
    }
  },

  markCompletedForUser: (userId: string) => {
    set({
      completed: true,
      error: null,
      isLoading: false,
      statusUserId: userId.trim() || null,
    });
  },

  setPlanType: (type: PlanType) => {
    set({
      planType: type,
      currentQuestionIndex: 0,
      answers: new Map(),
      audioRecords: [],
    });
  },

  getAnswer: (index: number) => {
    return get().answers.get(index);
  },

  setAnswer: (index: number, answer: Answer) => {
    const next = new Map(get().answers);
    next.set(index, answer);
    set({ answers: next });
  },

  setAnswers: (answers: Map<number, Answer>) => {
    set({ answers: new Map(answers) });
  },

  addAudioRecord: (record: AudioRecord) => {
    set({ audioRecords: [...get().audioRecords, record] });
  },

  nextQuestion: () => {
    set({ currentQuestionIndex: get().currentQuestionIndex + 1 });
  },

  previousQuestion: () => {
    const current = get().currentQuestionIndex;
    if (current > 0) {
      set({ currentQuestionIndex: current - 1 });
    }
  },

  setCurrentQuestionIndex: (index: number) => {
    set({ currentQuestionIndex: index });
  },

  upgradeToProfessional: () => {
    const currentAnswers = get().answers;
    const preserved = new Map<number, Answer>();

    for (let i = 0; i < 9; i++) {
      const val = currentAnswers.get(i);
      if (val !== undefined) preserved.set(i, val);
    }

    const web = currentAnswers.get(9);
    if (web !== undefined) preserved.set(16, web);

    const instagram = currentAnswers.get(10);
    if (instagram !== undefined) preserved.set(17, instagram);

    set({
      planType: "professional",
      currentQuestionIndex: 9,
      answers: preserved,
    });
  },

  clearAnswers: () => {
    set(buildEmptyDraftState());
  },

  resetSession: () => {
    get().clearAnswers();
    set({
      completed: false,
      error: null,
      isLoading: false,
      statusUserId: null,
    });
  },

  reset: async () => {
    get().clearAnswers();
    set({
      completed: false,
      error: null,
      isLoading: false,
      statusUserId: null,
    });
  },
}));
