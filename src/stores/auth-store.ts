import {
  authenticateWithBiometrics,
  clearCredentials,
  getCredentials,
  hasStoredCredentials,
  isBiometricsAvailable,
  saveCredentials,
} from "@/services/biometrics-service";
import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricsEnabled: boolean;

  signIn: (email: string, password: string) => void;
  signOut: () => Promise<void>;
  tryBiometricLogin: () => Promise<boolean>;
  enableBiometrics: (email: string, password: string) => Promise<void>;
  checkBiometricsStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  biometricsEnabled: false,

  signIn: (_email: string, _password: string) => {
    set({ isAuthenticated: true });
  },

  signOut: async () => {
    await clearCredentials();
    set({ isAuthenticated: false, biometricsEnabled: false });
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

    get().signIn(credentials.email, credentials.password);
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
}));
