import { create } from "zustand";

import { getSession, login, logout, register as registerUser } from "@/services/auth-service";
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

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricsEnabled: boolean;
  user: AuthSession | null;

  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  tryBiometricLogin: () => Promise<boolean>;
  enableBiometrics: (email: string, password: string) => Promise<void>;
  checkBiometricsStatus: () => Promise<void>;
  checkSession: () => Promise<void>;
}

async function enrichFromProfile(session: AuthSession): Promise<AuthSession> {
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

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  biometricsEnabled: false,
  user: null,

  signIn: async (email: string, password: string) => {
    const session = await login(email, password);
    const withEmail = { ...session, email: session.email ?? email };
    set({ isAuthenticated: true, user: withEmail });
    const enriched = await enrichFromProfile(withEmail);
    set({ user: enriched });
  },

  signOut: async () => {
    await clearCredentials();
    await logout();
    set({ isAuthenticated: false, user: null, biometricsEnabled: false });
  },

  register: async (email: string, password: string, displayName?: string) => {
    const session = await registerUser(email, password, displayName ?? null);
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
    const withEmail = { ...session, email: session.email ?? credentials.email };
    set({ isAuthenticated: true, user: withEmail });
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
    set({ biometricsEnabled: available && stored, isLoading: false });
  },

  checkSession: async () => {
    const session = await getSession();
    if (session) {
      set({ isAuthenticated: true, user: session });
      const enriched = await enrichFromProfile(session);
      set({ user: enriched });
    }
  },
}));
