import { storage } from "@/lib/storage";
import { clearStoredSession } from "@/services/auth-service";
import { clearCredentials } from "@/services/biometrics-service";
import { useAuthStore } from "@/stores/auth-store";
import { DEBUG_STORAGE_KEY, useDebugStore } from "@/stores/debug-store";
import { LOCAL_RECORDINGS_STORAGE_KEY } from "@/stores/recordings-store";
import { clearUserScopedStores } from "@/utils/clear-user-data";

export async function clearLocalAppData(): Promise<void> {
  await Promise.all([
    clearStoredSession(),
    clearCredentials(),
    storage.remove(LOCAL_RECORDINGS_STORAGE_KEY),
    storage.remove(DEBUG_STORAGE_KEY),
  ]);

  await clearUserScopedStores();
  useAuthStore.getState().resetLocalState();
  await useDebugStore.getState().lock();
}
