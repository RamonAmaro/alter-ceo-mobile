import { Platform } from "react-native";

import * as SecureStore from "@/services/secure-store";

import { apiClient, handleAxiosError, setAuthCookieGetter } from "@/lib/api-client";
import { ApiError } from "@/types/api";
import { SESSION_COOKIE_KEY, type AuthSession } from "@/types/auth";
import { extractSessionCookie } from "@/utils/extract-session-cookie";

interface RawAuthSessionResponse {
  user_id: string;
  email?: string | null;
  roles: string[];
}

function mapSession(raw: RawAuthSessionResponse, displayName?: string | null): AuthSession {
  return {
    userId: raw.user_id,
    email: raw.email ?? null,
    displayName: displayName ?? null,
    roles: raw.roles,
  };
}

async function saveSession(cookie: string): Promise<void> {
  setAuthCookieGetter(() => cookie);
  await SecureStore.setItemAsync(SESSION_COOKIE_KEY, cookie);
}

export async function clearStoredSession(): Promise<void> {
  setAuthCookieGetter(() => null);
  await SecureStore.deleteItemAsync(SESSION_COOKIE_KEY);
}

export async function initAuthCookie(): Promise<void> {
  const stored = await SecureStore.getItemAsync(SESSION_COOKIE_KEY);
  setAuthCookieGetter(() => stored ?? null);
}

// Browsers apply Set-Cookie transparently on the response that delivered it,
// but on cross-site contexts Safari/iOS silently drops cookies that lack
// SameSite=None; Secure. A follow-up request confirms whether the cookie was
// actually persisted — if /auth/session returns 401, the browser rejected it.
async function verifyCookieAccepted(): Promise<void> {
  if (Platform.OS !== "web") return;
  try {
    await apiClient.get<RawAuthSessionResponse>("/auth/session");
  } catch {
    throw new ApiError(
      0,
      "Tu navegador está bloqueando las cookies. Revisa los ajustes de privacidad o prueba con otro navegador.",
    );
  }
}

export async function login(email: string, password: string): Promise<AuthSession> {
  try {
    const response = await apiClient.post<RawAuthSessionResponse>("/auth/login", {
      email,
      password,
    });
    const cookie = extractSessionCookie(response.headers);
    if (cookie) await saveSession(cookie);
    await verifyCookieAccepted();
    return mapSession(response.data);
  } catch (err) {
    return handleAxiosError(err);
  }
}

export async function register(
  email: string,
  password: string,
  displayName?: string | null,
): Promise<AuthSession> {
  try {
    const response = await apiClient.post<RawAuthSessionResponse>("/auth/register", {
      email,
      password,
      display_name: displayName ?? null,
    });
    const cookie = extractSessionCookie(response.headers);
    if (cookie) await saveSession(cookie);
    await verifyCookieAccepted();
    return mapSession(response.data);
  } catch (err) {
    return handleAxiosError(err);
  }
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const response = await apiClient.get<RawAuthSessionResponse>("/auth/session");
    return mapSession(response.data);
  } catch {
    await clearStoredSession();
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    await clearStoredSession();
  }
}
