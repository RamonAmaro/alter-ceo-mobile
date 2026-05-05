import { storage } from "@/lib/storage";

const REMEMBERED_EMAIL_KEY = "alterceo_remembered_email";

// Stores ONLY the email (no password) so the next login pre-fills the input.
// The browser's password manager handles credential autofill via autoComplete
// attributes — we never store passwords in JS-accessible storage.
export async function getRememberedEmail(): Promise<string | null> {
  return storage.getString(REMEMBERED_EMAIL_KEY);
}

export async function setRememberedEmail(email: string): Promise<void> {
  await storage.setString(REMEMBERED_EMAIL_KEY, email);
}

export async function clearRememberedEmail(): Promise<void> {
  await storage.remove(REMEMBERED_EMAIL_KEY);
}
