import { useActiveRecordingStore } from "@/stores/active-recording-store";
import { useChatStore } from "@/stores/chat-store";
import { useMeetingStore } from "@/stores/meeting-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { usePlanStore } from "@/stores/plan-store";
import { useRecordingsStore } from "@/stores/recordings-store";

export async function clearUserScopedStores(): Promise<void> {
  useChatStore.getState().reset();
  useMeetingStore.getState().reset();
  usePlanStore.getState().reset();
  useActiveRecordingStore.getState().setActiveId(null);
  await useOnboardingStore.getState().reset();
  await useRecordingsStore.getState().reset();
}
