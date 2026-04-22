// ─── API ──────────────────────────────────────────────────────────────────────

import { Platform } from "react-native";

const PROD_API_BASE_URL = "https://api.alterceo.app";
const LOCAL_API_BASE_URL = "http://localhost:8000";
const USE_LOCAL_API = process.env.EXPO_PUBLIC_USE_LOCAL_API === "true";

// In production web builds (Vercel deploy) we route through a same-origin
// rewrite (/api → api.alterceo.app, configured in vercel.json) so the session
// cookie stays first-party — iOS Safari/WebKit blocks cross-site cookies via
// ITP even with SameSite=None; Secure. In dev (__DEV__ true, expo start --web)
// we hit the backend directly because there is no rewrite server in front.
function resolveApiBaseUrl(): string {
  if (USE_LOCAL_API) return LOCAL_API_BASE_URL;
  if (Platform.OS === "web" && !__DEV__) return "/api";
  return PROD_API_BASE_URL;
}

export const API_ENVIRONMENT = USE_LOCAL_API ? "local" : "production";
export const API_BASE_URL = resolveApiBaseUrl();
// Absolute URL always — WebSocket connections can't use relative paths and
// the Vercel rewrite proxy doesn't tunnel WS upgrades.
export const API_ABSOLUTE_URL = USE_LOCAL_API ? LOCAL_API_BASE_URL : PROD_API_BASE_URL;
export const API_VERSION = "v1";
export const API_TIMEOUT = 30_000;

// ─── Realtime ─────────────────────────────────────────────────────────────────

export const POLL_INTERVAL = 3_000;

// ─── Auth / Session ───────────────────────────────────────────────────────────

export const SESSION_COOKIE_NAME = "alterceo_session";
