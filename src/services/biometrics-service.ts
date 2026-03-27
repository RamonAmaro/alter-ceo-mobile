import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const CREDENTIALS_KEY = "alterceo_credentials";

interface StoredCredentials {
  email: string;
  password: string;
}

export async function isBiometricsAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;

  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

export async function authenticateWithBiometrics(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Inicia sesión con biometría",
    cancelLabel: "Cancelar",
    disableDeviceFallback: false,
  });

  return result.success;
}

export async function saveCredentials(email: string, password: string): Promise<void> {
  const data: StoredCredentials = { email, password };
  await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify(data));
}

export async function getCredentials(): Promise<StoredCredentials | null> {
  const raw = await SecureStore.getItemAsync(CREDENTIALS_KEY);
  if (!raw) return null;

  return JSON.parse(raw) as StoredCredentials;
}

export async function clearCredentials(): Promise<void> {
  await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
}

export async function hasStoredCredentials(): Promise<boolean> {
  const raw = await SecureStore.getItemAsync(CREDENTIALS_KEY);
  return raw !== null;
}
