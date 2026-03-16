import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const ONBOARDING_KEY = "onboarding_completed";

type PlanType = "express" | "professional";

interface OnboardingState {
  completed: boolean;
  planType: PlanType | null;
  isLoading: boolean;

  load: () => Promise<void>;
  setPlanType: (type: PlanType) => void;
  complete: () => Promise<void>;
  reset: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  completed: false,
  planType: null,
  isLoading: true,

  load: async () => {
    const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
    set({ completed: value === "true", isLoading: false });
  },

  setPlanType: (type: PlanType) => {
    set({ planType: type });
  },

  complete: async () => {
    await SecureStore.setItemAsync(ONBOARDING_KEY, "true");
    set({ completed: true });
  },

  reset: async () => {
    await SecureStore.deleteItemAsync(ONBOARDING_KEY);
    set({ completed: false, planType: null });
  },
}));
