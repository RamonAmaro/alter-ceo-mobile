import { create } from "zustand";

import { storage } from "@/lib/storage";
import { getBusinessKernel } from "@/services/business-kernel-service";
import { createPersistDebouncer } from "@/services/persist-debounce-service";
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

interface DraftPersistPayload {
  readonly userId: string;
  readonly draft: PersistedDraft;
}

function draftKey(userId: string): string {
  return `${ONBOARDING_DRAFT_STORAGE_PREFIX}${userId}`;
}

async function persistDraft(userId: string, draft: PersistedDraft): Promise<void> {
  await storage.setJSON(draftKey(userId), draft);
}

async function clearPersistedDraft(userId: string): Promise<void> {
  await storage.remove(draftKey(userId));
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
  // True when the onboarding flow was opened from inside the app
  // (e.g., user clicked "Plan de Duplicación" from the strategy screen
  // to regenerate). Lets the layout show sidebar + back button.
  openedFromApp: boolean;

  load: () => Promise<void>;
  resolveCompletionStatus: (userId: string) => Promise<void>;
  markCompletedForUser: (userId: string) => void;
  setPlanType: (type: PlanType) => void;
  setOpenedFromApp: (value: boolean) => void;
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

const draftDebouncer = createPersistDebouncer<DraftPersistPayload | null>(async (payload) => {
  if (!payload) return;
  await persistDraft(payload.userId, payload.draft);
}, DRAFT_DEBOUNCE_MS);

function buildDraftPayload(state: OnboardingState): DraftPersistPayload | null {
  if (!state.statusUserId) return null;
  return {
    userId: state.statusUserId,
    draft: {
      planType: state.planType,
      currentQuestionIndex: state.currentQuestionIndex,
      answers: Array.from(state.answers.entries()),
      audioRecords: state.audioRecords,
    },
  };
}

function schedulePersistDraft(getState: () => OnboardingState): void {
  draftDebouncer.schedule(() => buildDraftPayload(getState()));
}

function cancelScheduledDraftPersist(): void {
  draftDebouncer.cancel();
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  completed: false,
  error: null,
  isLoading: true,
  statusUserId: null,
  openedFromApp: false,
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

  setOpenedFromApp: (value: boolean) => {
    set({ openedFromApp: value });
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
    const parsed = await storage.getJSON<PersistedDraft>(draftKey(userId));
    if (!parsed || typeof parsed !== "object") return;
    const answers = Array.isArray(parsed.answers) ? parsed.answers : [];
    const audioRecords = Array.isArray(parsed.audioRecords) ? parsed.audioRecords : [];
    set({
      planType: parsed.planType,
      currentQuestionIndex:
        typeof parsed.currentQuestionIndex === "number" ? parsed.currentQuestionIndex : 0,
      answers: new Map(answers),
      audioRecords,
    });
  },
}));
