// ─── API ──────────────────────────────────────────────────────────────────────

const PROD_API_BASE_URL = "https://api.alterceo.app";
const LOCAL_API_BASE_URL = "http://localhost:8000";
const USE_LOCAL_API = process.env.EXPO_PUBLIC_USE_LOCAL_API === "true";

export const API_ENVIRONMENT = USE_LOCAL_API ? "local" : "production";
export const API_BASE_URL = USE_LOCAL_API ? LOCAL_API_BASE_URL : PROD_API_BASE_URL;
export const API_VERSION = "v1";
export const API_TIMEOUT = 30_000;

// ─── Realtime ─────────────────────────────────────────────────────────────────

export const POLL_INTERVAL = 3_000;

// ─── Auth / Session ───────────────────────────────────────────────────────────

export const SESSION_COOKIE_NAME = "alterceo_session";
