import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const ONBOARDING_KEY = "onboarding_completed";

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
  planType: PlanType | null;
  isLoading: boolean;
  currentQuestionIndex: number;
  answers: Map<number, Answer>;
  audioRecords: AudioRecord[];

  load: () => Promise<void>;
  setPlanType: (type: PlanType) => void;
  getAnswer: (index: number) => Answer | undefined;
  setAnswer: (index: number, answer: Answer) => void;
  setAnswers: (answers: Map<number, Answer>) => void;
  addAudioRecord: (record: AudioRecord) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  setCurrentQuestionIndex: (index: number) => void;
  upgradeToProfessional: () => void;
  complete: () => Promise<void>;
  clearAnswers: () => void;
  reset: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  completed: false,
  planType: null,
  isLoading: true,
  currentQuestionIndex: 0,
  answers: new Map(),
  audioRecords: [],

  load: async () => {
    const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
    set({ completed: value === "true", isLoading: false });
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

  complete: async () => {
    await SecureStore.setItemAsync(ONBOARDING_KEY, "true");
    set({ completed: true });
  },

  clearAnswers: () => {
    set({
      planType: null,
      currentQuestionIndex: 0,
      answers: new Map(),
      audioRecords: [],
    });
  },

  reset: async () => {
    await SecureStore.deleteItemAsync(ONBOARDING_KEY);
    set({
      completed: false,
      planType: null,
      currentQuestionIndex: 0,
      answers: new Map(),
      audioRecords: [],
    });
  },
}));
