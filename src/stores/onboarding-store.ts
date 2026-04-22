import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { getBusinessKernel } from "@/services/business-kernel-service";
import { ApiError } from "@/types/api";
import { toErrorMessage } from "@/utils/to-error-message";

// Onboarding draft: preservado através de 401 para que o usuário não perca o progresso
// de preenchimento quando a sessão expira no meio do flow.
const ONBOARDING_DRAFT_STORAGE_PREFIX = "onboarding_draft_v1:";
const DRAFT_DEBOUNCE_MS = 400;

interface PersistedDraft {
  planType: PlanType | null;
  currentQuestionIndex: number;
  answers: [number, Answer][];
  audioRecords: AudioRecord[];
}

let draftPersistTimer: ReturnType<typeof setTimeout> | null = null;

function draftKey(userId: string): string {
  return `${ONBOARDING_DRAFT_STORAGE_PREFIX}${userId}`;
}

async function persistDraft(userId: string, draft: PersistedDraft): Promise<void> {
  try {
    await AsyncStorage.setItem(draftKey(userId), JSON.stringify(draft));
  } catch {
    // best-effort
  }
}

async function clearPersistedDraft(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(draftKey(userId));
  } catch {
    // best-effort
  }
}

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
  resetKeepingDraft: () => void;
  restoreDraft: (userId: string) => Promise<void>;
}

function buildEmptyDraftState() {
  return {
    planType: null,
    currentQuestionIndex: 0,
    answers: new Map<number, Answer>(),
    audioRecords: [] as AudioRecord[],
  };
}

function cancelScheduledDraftPersist(): void {
  if (draftPersistTimer) {
    clearTimeout(draftPersistTimer);
    draftPersistTimer = null;
  }
}

function schedulePersistDraft(getState: () => OnboardingState): void {
  if (draftPersistTimer) clearTimeout(draftPersistTimer);
  draftPersistTimer = setTimeout(() => {
    draftPersistTimer = null;
    const s = getState();
    if (!s.statusUserId) return;
    void persistDraft(s.statusUserId, {
      planType: s.planType,
      currentQuestionIndex: s.currentQuestionIndex,
      answers: Array.from(s.answers.entries()),
      audioRecords: s.audioRecords,
    });
  }, DRAFT_DEBOUNCE_MS);
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
        await get().restoreDraft(normalizedUserId);
        return;
      }

      set({
        completed: false,
        error: toErrorMessage(err),
        isLoading: false,
        statusUserId: normalizedUserId,
      });
      await get().restoreDraft(normalizedUserId);
    }
  },

  markCompletedForUser: (userId: string) => {
    cancelScheduledDraftPersist();
    const normalizedUserId = userId.trim() || null;
    set({
      completed: true,
      error: null,
      isLoading: false,
      statusUserId: normalizedUserId,
    });
    if (normalizedUserId) void clearPersistedDraft(normalizedUserId);
  },

  setPlanType: (type: PlanType) => {
    set({
      planType: type,
      currentQuestionIndex: 0,
      answers: new Map(),
      audioRecords: [],
    });
    schedulePersistDraft(get);
  },

  getAnswer: (index: number) => {
    return get().answers.get(index);
  },

  setAnswer: (index: number, answer: Answer) => {
    const next = new Map(get().answers);
    next.set(index, answer);
    set({ answers: next });
    schedulePersistDraft(get);
  },

  setAnswers: (answers: Map<number, Answer>) => {
    set({ answers: new Map(answers) });
    schedulePersistDraft(get);
  },

  addAudioRecord: (record: AudioRecord) => {
    set({ audioRecords: [...get().audioRecords, record] });
    schedulePersistDraft(get);
  },

  nextQuestion: () => {
    set({ currentQuestionIndex: get().currentQuestionIndex + 1 });
    schedulePersistDraft(get);
  },

  previousQuestion: () => {
    const current = get().currentQuestionIndex;
    if (current > 0) {
      set({ currentQuestionIndex: current - 1 });
      schedulePersistDraft(get);
    }
  },

  setCurrentQuestionIndex: (index: number) => {
    set({ currentQuestionIndex: index });
    schedulePersistDraft(get);
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
    schedulePersistDraft(get);
  },

  clearAnswers: () => {
    set(buildEmptyDraftState());
    schedulePersistDraft(get);
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

  // Clears in-memory state. Persisted per-user draft is kept intact so the
  // user finds it on next sign-in (whether after logout, 401, or account
  // switch). Drafts are only explicitly purged on successful submission
  // (`markCompletedForUser`) or by uninstalling the app.
  reset: async () => {
    cancelScheduledDraftPersist();
    set({
      ...buildEmptyDraftState(),
      completed: false,
      error: null,
      isLoading: false,
      statusUserId: null,
    });
  },

  // Clears transient completion/status flags but keeps the in-memory draft
  // AND the persisted draft intact. Use this on 401 / session expiry so the
  // user recovers their progress after signing back in.
  resetKeepingDraft: () => {
    set({
      completed: false,
      error: null,
      isLoading: false,
      statusUserId: null,
    });
  },

  restoreDraft: async (userId: string) => {
    try {
      const raw = await AsyncStorage.getItem(draftKey(userId));
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistedDraft;
      set({
        planType: parsed.planType,
        currentQuestionIndex: parsed.currentQuestionIndex ?? 0,
        answers: new Map(parsed.answers ?? []),
        audioRecords: parsed.audioRecords ?? [],
      });
    } catch {
      // best-effort — if draft is corrupted, start fresh
    }
  },
}));
