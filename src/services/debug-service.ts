import AsyncStorage from "@react-native-async-storage/async-storage";

import { clearCredentials } from "@/services/biometrics-service";
import { clearStoredSession } from "@/services/auth-service";
import * as SecureStore from "@/services/secure-store";
import { useActiveRecordingStore } from "@/stores/active-recording-store";
import { useAuthStore } from "@/stores/auth-store";
import { DEBUG_STORAGE_KEY, useDebugStore } from "@/stores/debug-store";
import { useChatStore } from "@/stores/chat-store";
import { useMeetingStore } from "@/stores/meeting-store";
import { ONBOARDING_KEY, useOnboardingStore } from "@/stores/onboarding-store";
import { usePlanStore } from "@/stores/plan-store";
import { LOCAL_RECORDINGS_STORAGE_KEY, useRecordingsStore } from "@/stores/recordings-store";

export async function clearLocalAppData(): Promise<void> {
  await Promise.all([
    clearStoredSession(),
    clearCredentials(),
    SecureStore.deleteItemAsync(ONBOARDING_KEY),
    AsyncStorage.removeItem(LOCAL_RECORDINGS_STORAGE_KEY),
    AsyncStorage.removeItem(DEBUG_STORAGE_KEY),
  ]);

  useChatStore.getState().reset();
  useMeetingStore.getState().reset();
  usePlanStore.getState().reset();
  useActiveRecordingStore.getState().setActiveId(null);
  useAuthStore.getState().resetLocalState();
  await useOnboardingStore.getState().reset();
  await useRecordingsStore.getState().reset();
  await useDebugStore.getState().lock();
}
