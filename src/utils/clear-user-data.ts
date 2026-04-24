import AsyncStorage from "@react-native-async-storage/async-storage";

import { useActiveRecordingStore } from "@/stores/active-recording-store";
import { useChatStore } from "@/stores/chat-store";
import { useMeetingStore } from "@/stores/meeting-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { usePlanStore } from "@/stores/plan-store";
import { useRecordingsStore } from "@/stores/recordings-store";
import { useStrategyReportStore } from "@/stores/strategy-report-store";

const LAST_USER_ID_KEY = "alterceo_last_user_id";

export async function clearUserScopedStores(): Promise<void> {
  useChatStore.getState().reset();
  useMeetingStore.getState().reset();
  usePlanStore.getState().reset();
  useStrategyReportStore.getState().reset();
  useActiveRecordingStore.getState().setActiveId(null);
  await useOnboardingStore.getState().reset();
  await useRecordingsStore.getState().reset();
}

// Like `clearUserScopedStores`, but preserves user drafts & pending local work
// so the user doesn't lose anything they were producing if their session
// expires (401) mid-flow. Safe to call on session expiry.
export async function clearUserScopedStoresKeepingPending(): Promise<void> {
  useChatStore.getState().resetKeepingDrafts();
  useMeetingStore.getState().reset();
  usePlanStore.getState().reset();
  useStrategyReportStore.getState().resetKeepingDraft();
  useActiveRecordingStore.getState().setActiveId(null);
  useOnboardingStore.getState().resetKeepingDraft();
  await useRecordingsStore.getState().resetKeepingPending();
}

export async function getLastAuthenticatedUserId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_USER_ID_KEY);
  } catch {
    return null;
  }
}

export async function setLastAuthenticatedUserId(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_USER_ID_KEY, userId);
  } catch {
    // ignore
  }
}

export async function clearLastAuthenticatedUserId(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LAST_USER_ID_KEY);
  } catch {
    // ignore
  }
}

export async function ensureCleanForUser(nextUserId: string): Promise<void> {
  const last = await getLastAuthenticatedUserId();
  if (last !== nextUserId) {
    await clearUserScopedStores();
  }
  await setLastAuthenticatedUserId(nextUserId);
}

export async function ensureCleanOnSignOut(): Promise<void> {
  await clearUserScopedStores();
  await clearLastAuthenticatedUserId();
}
