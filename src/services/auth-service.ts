import * as SecureStore from "expo-secure-store";

import { getRaw, postRaw, setAuthCookieGetter } from "@/lib/api-client";
import { SESSION_COOKIE_KEY, type AuthSession } from "@/types/auth";
import { extractSessionCookie } from "@/utils/extract-session-cookie";

interface RawAuthSessionResponse {
  user_id: string;
  email?: string | null;
  roles: string[];
}

function mapSession(raw: RawAuthSessionResponse): AuthSession {
  return {
    userId: raw.user_id,
    email: raw.email ?? null,
    roles: raw.roles,
  };
}

export async function initAuthCookie(): Promise<void> {
  const stored = await SecureStore.getItemAsync(SESSION_COOKIE_KEY);
  setAuthCookieGetter(() => stored);
}

export async function login(
  email: string,
  password: string,
): Promise<AuthSession> {
  const response = await postRaw("/auth/login", { email, password });
  const cookie = extractSessionCookie(response.headers);
  if (cookie) {
    await SecureStore.setItemAsync(SESSION_COOKIE_KEY, cookie);
    setAuthCookieGetter(() => cookie);
  }
  const raw = (await response.json()) as RawAuthSessionResponse;
  return mapSession(raw);
}

export async function register(
  email: string,
  password: string,
  displayName?: string | null,
): Promise<AuthSession> {
  const response = await postRaw("/auth/register", {
    email,
    password,
    display_name: displayName ?? null,
  });
  const cookie = extractSessionCookie(response.headers);
  if (cookie) {
    await SecureStore.setItemAsync(SESSION_COOKIE_KEY, cookie);
    setAuthCookieGetter(() => cookie);
  }
  const raw = (await response.json()) as RawAuthSessionResponse;
  return mapSession(raw);
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const response = await getRaw("/auth/session");
    const raw = (await response.json()) as RawAuthSessionResponse;
    return mapSession(raw);
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await postRaw("/auth/logout");
  } finally {
    await SecureStore.deleteItemAsync(SESSION_COOKIE_KEY);
    setAuthCookieGetter(() => null);
  }
}
