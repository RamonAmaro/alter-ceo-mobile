import { useEffect } from "react";

import { hasStoredSessionCookie, initAuthCookie } from "@/services/auth-service";
import { checkAndApplyUpdate } from "@/services/updates-service";
import { useAuthStore } from "@/stores/auth-store";
import { useDebugStore } from "@/stores/debug-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { getLastAuthenticatedUserId } from "@/utils/clear-user-data";

async function runBootstrap(): Promise<void> {
  const { load: loadDebugState } = useDebugStore.getState();
  const { load: loadOnboarding } = useOnboardingStore.getState();

  await Promise.all([loadDebugState(), loadOnboarding()]);
  await initAuthCookie();

  const [hasCookie, lastUserId] = await Promise.all([
    hasStoredSessionCookie(),
    getLastAuthenticatedUserId(),
  ]);

  const auth = useAuthStore.getState();
  auth.applyOptimisticBootstrap(hasCookie, lastUserId);
  void auth.checkSession();
  void auth.checkBiometricsStatus();
}

export function useAppBootstrap(fontsLoaded: boolean): void {
  useEffect(() => {
    if (!fontsLoaded) return;
    void runBootstrap();
    void checkAndApplyUpdate();
  }, [fontsLoaded]);
}
