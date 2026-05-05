import { storage } from "@/lib/storage";
import { useActiveRecordingStore } from "@/stores/active-recording-store";
import { useChatAudioDraftStore } from "@/stores/chat-audio-draft-store";
import { useChatStore } from "@/stores/chat-store";
import { useMeetingStore } from "@/stores/meeting-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { usePlanStore } from "@/stores/plan-store";
import { useRecordingsStore } from "@/stores/recordings-store";
import { useSourcesStore } from "@/stores/sources-store";
import { useStrategiesStore } from "@/stores/strategies-store";
import { useStrategyReportStore } from "@/stores/strategy-report-store";
import { useTaskStore } from "@/stores/task-store";

const LAST_USER_ID_KEY = "alterceo_last_user_id";

export async function clearUserScopedStores(): Promise<void> {
  useChatStore.getState().reset();
  useMeetingStore.getState().reset();
  usePlanStore.getState().reset();
  useSourcesStore.getState().reset();
  useStrategyReportStore.getState().reset();
  useStrategiesStore.getState().reset();
  useTaskStore.getState().reset();
  useActiveRecordingStore.getState().setActiveId(null);
  await useOnboardingStore.getState().reset();
  await useRecordingsStore.getState().reset();
  await useChatAudioDraftStore.getState().reset();
}

// Like `clearUserScopedStores`, but preserves user drafts & pending local work
// so the user doesn't lose anything they were producing if their session
// expires (401) mid-flow. Safe to call on session expiry.
export async function clearUserScopedStoresKeepingPending(): Promise<void> {
  useChatStore.getState().resetKeepingDrafts();
  useMeetingStore.getState().reset();
  usePlanStore.getState().reset();
  useSourcesStore.getState().reset();
  useStrategyReportStore.getState().resetKeepingDraft();
  useStrategiesStore.getState().reset();
  useTaskStore.getState().reset();
  useActiveRecordingStore.getState().setActiveId(null);
  useOnboardingStore.getState().resetKeepingDraft();
  await useRecordingsStore.getState().resetKeepingPending();
  useChatAudioDraftStore.getState().resetKeepingDrafts();
}

export async function getLastAuthenticatedUserId(): Promise<string | null> {
  return storage.getString(LAST_USER_ID_KEY);
}

export async function setLastAuthenticatedUserId(userId: string): Promise<void> {
  await storage.setString(LAST_USER_ID_KEY, userId);
}

export async function clearLastAuthenticatedUserId(): Promise<void> {
  await storage.remove(LAST_USER_ID_KEY);
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
