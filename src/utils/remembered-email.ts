import AsyncStorage from "@react-native-async-storage/async-storage";

const REMEMBERED_EMAIL_KEY = "alterceo_remembered_email";

// Stores ONLY the email (no password) so the next login pre-fills the input.
// The browser's password manager handles credential autofill via autoComplete
// attributes — we never store passwords in JS-accessible storage.
export async function getRememberedEmail(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(REMEMBERED_EMAIL_KEY);
  } catch {
    return null;
  }
}

export async function setRememberedEmail(email: string): Promise<void> {
  try {
    await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email);
  } catch {
    // best-effort
  }
}

export async function clearRememberedEmail(): Promise<void> {
  try {
    await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
  } catch {
    // best-effort
  }
}
