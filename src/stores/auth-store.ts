import { create } from "zustand";

import { setOnUnauthorizedHandler } from "@/lib/api-client";
import {
  getSession,
  hasStoredSessionCookie,
  login,
  logout,
  register as registerUser,
} from "@/services/auth-service";
import { getUser } from "@/services/user-service";
import {
  authenticateWithBiometrics,
  clearCredentials,
  getCredentials,
  hasStoredCredentials,
  isBiometricsAvailable,
  saveCredentials,
} from "@/services/biometrics-service";
import type { AuthSession } from "@/types/auth";
import {
  clearUserScopedStoresKeepingPending,
  ensureCleanForUser,
  ensureCleanOnSignOut,
} from "@/utils/clear-user-data";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricsEnabled: boolean;
  user: AuthSession | null;
  // True when the bootstrap session check failed by network/timeout (not 401).
  // The session is treated optimistically as valid until proven otherwise.
  hasNetworkError: boolean;
  // Set to true when a session is invalidated (401 or explicit unauthorized)
  // so the login screen can auto-trigger biometrics on mount.
  shouldAutoBiometrics: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  handleUnauthorized: () => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  tryBiometricLogin: () => Promise<boolean>;
  enableBiometrics: (email: string, password: string) => Promise<void>;
  checkBiometricsStatus: () => Promise<void>;
  checkSession: () => Promise<void>;
  retrySession: () => Promise<void>;
  consumeAutoBiometrics: () => void;
  applyOptimisticBootstrap: (hasCookie: boolean, lastUserId: string | null) => void;
  resetLocalState: () => void;
}

// Module-scoped Promise to dedupe concurrent retrySession() calls. When the
// network is down and the overlay polls every 4s, /auth/session can take up to
// 30s to time out — without dedupe we'd accumulate parallel in-flight requests.
// Callers await the same Promise and let the runtime collapse them to one.
let inFlightRetry: Promise<void> | null = null;

async function enrichFromProfile(session: AuthSession): Promise<AuthSession> {
  // Guard against bootstrap races where the session was set optimistically
  // before user_id was resolved. Without this, we would call /users/undefined
  // and the backend would reject it (403 — not 401, so the auth interceptor
  // would not sign the user out, the request would just fail noisily).
  if (!session.userId) return session;
  try {
    const profile = await getUser(session.userId);
    return {
      ...session,
      displayName: profile.display_name || session.displayName,
    };
  } catch {
    return session;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  biometricsEnabled: false,
  user: null,
  hasNetworkError: false,
  shouldAutoBiometrics: false,

  signIn: async (email: string, password: string) => {
    const session = await login(email, password);
    await ensureCleanForUser(session.userId);
    const withEmail = { ...session, email: session.email ?? email };
    set({
      isAuthenticated: true,
      user: withEmail,
      hasNetworkError: false,
      shouldAutoBiometrics: false,
    });
    const enriched = await enrichFromProfile(withEmail);
    set({ user: enriched });
  },

  signOut: async () => {
    await clearCredentials();
    await logout();
    await ensureCleanOnSignOut();
    set({
      isAuthenticated: false,
      user: null,
      biometricsEnabled: false,
      hasNetworkError: false,
      shouldAutoBiometrics: false,
    });
  },

  handleUnauthorized: async () => {
    await logout();
    await clearUserScopedStoresKeepingPending();
    set({
      isAuthenticated: false,
      user: null,
      hasNetworkError: false,
      shouldAutoBiometrics: true,
    });
  },

  register: async (email: string, password: string, displayName?: string) => {
    const session = await registerUser(email, password, displayName ?? null);
    await ensureCleanForUser(session.userId);
    set({ isAuthenticated: true, user: session });
    const enriched = await enrichFromProfile(session);
    set({ user: enriched });
  },

  tryBiometricLogin: async () => {
    const available = await isBiometricsAvailable();
    if (!available) return false;

    const stored = await hasStoredCredentials();
    if (!stored) return false;

    const authenticated = await authenticateWithBiometrics();
    if (!authenticated) return false;

    const credentials = await getCredentials();
    if (!credentials) return false;

    const session = await login(credentials.email, credentials.password);
    await ensureCleanForUser(session.userId);
    const withEmail = { ...session, email: session.email ?? credentials.email };
    set({
      isAuthenticated: true,
      user: withEmail,
      hasNetworkError: false,
      shouldAutoBiometrics: false,
    });
    const enriched = await enrichFromProfile(withEmail);
    set({ user: enriched });
    return true;
  },

  enableBiometrics: async (email: string, password: string) => {
    await saveCredentials(email, password);
    set({ biometricsEnabled: true });
  },

  checkBiometricsStatus: async () => {
    const available = await isBiometricsAvailable();
    const stored = await hasStoredCredentials();
    set({ biometricsEnabled: available && stored });
  },

  checkSession: async () => {
    // Optimistic bootstrap: if a cookie is stored locally, enter the app right
    // away while validation runs in the background. The user reaches their data
    // even on a flaky connection. If the backend later confirms the session is
    // dead (401), the api-client interceptor signs them out via
    // handleUnauthorized — there is no race window because the in-flight
    // request still carries the (now-known-stale) cookie and will surface 401
    // via the same interceptor path on first authenticated call.
    const hasCookie = await hasStoredSessionCookie();
    if (hasCookie) {
      set({ isAuthenticated: true, isLoading: false, hasNetworkError: false });
    }

    const result = await getSession();

    if (result.kind === "ok") {
      await ensureCleanForUser(result.session.userId);
      set({
        isAuthenticated: true,
        user: result.session,
        isLoading: false,
        hasNetworkError: false,
      });
      const enriched = await enrichFromProfile(result.session);
      set({ user: enriched });
      return;
    }

    if (result.kind === "unauthorized") {
      await ensureCleanOnSignOut();
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        hasNetworkError: false,
        shouldAutoBiometrics: true,
      });
      return;
    }

    // Network error: if we have a stored cookie, stay optimistically signed in
    // and surface the network state so the UI can show "Aguardando conexión".
    // If we have no cookie, we cannot enter optimistically — fall back to the
    // login screen but flag the network issue for the user.
    if (hasCookie) {
      set({ isLoading: false, hasNetworkError: true });
    } else {
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        hasNetworkError: true,
      });
    }
  },

  retrySession: async () => {
    if (inFlightRetry) return inFlightRetry;
    const run = (async () => {
      const result = await getSession();
      if (result.kind === "ok") {
        await ensureCleanForUser(result.session.userId);
        set({
          isAuthenticated: true,
          user: result.session,
          hasNetworkError: false,
        });
        const enriched = await enrichFromProfile(result.session);
        set({ user: enriched });
        return;
      }
      if (result.kind === "unauthorized") {
        await ensureCleanOnSignOut();
        set({
          isAuthenticated: false,
          user: null,
          hasNetworkError: false,
          shouldAutoBiometrics: true,
        });
        return;
      }
      set({ hasNetworkError: true });
    })();
    inFlightRetry = run.finally(() => {
      inFlightRetry = null;
    });
    return inFlightRetry;
  },

  consumeAutoBiometrics: () => {
    if (get().shouldAutoBiometrics) {
      set({ shouldAutoBiometrics: false });
    }
  },

  applyOptimisticBootstrap: (hasCookie: boolean, lastUserId: string | null) => {
    // If we have both a session cookie AND a remembered userId, restore a
    // placeholder user so screens that read user?.userId during the bootstrap
    // window do not fire requests with `undefined`. checkSession() will replace
    // this with the real session payload once /auth/session resolves.
    const placeholder: AuthSession | null =
      hasCookie && lastUserId
        ? { userId: lastUserId, email: null, displayName: null, roles: [] }
        : null;
    set({
      isAuthenticated: hasCookie,
      user: placeholder,
      isLoading: false,
    });
  },

  resetLocalState: () => {
    set({
      isAuthenticated: false,
      isLoading: false,
      biometricsEnabled: false,
      user: null,
      hasNetworkError: false,
      shouldAutoBiometrics: false,
    });
  },
}));

// Force sign-out on any 401 response (session expired / invalid).
// Preserve biometric credentials AND pending local recordings — 401 means the
// session expired, not that the user revoked access. They can re-enter via
// FaceID/biometrics and find any unsent recording still waiting.
setOnUnauthorizedHandler(() => {
  const { isAuthenticated, handleUnauthorized } = useAuthStore.getState();
  const task = isAuthenticated ? handleUnauthorized() : clearUserScopedStoresKeepingPending();
  task.catch(() => {
    // Already best-effort: if clearing fails we cannot recover here, and the
    // failure itself is not actionable by the user. Swallow to avoid an
    // unhandled rejection in the 401 hot path.
  });
});
