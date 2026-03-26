import { API_BASE_URL, API_VERSION, SESSION_COOKIE_NAME } from "@/constants/env";
import { buildAuthHeaders } from "@/lib/api-client";
import type { SSEEvent } from "@/utils/sse-parser";
import CookieManager from "@react-native-cookies/cookies";
import EventSource from "react-native-sse";

const SSE_EVENT_TYPES = [
  "queued",
  "running",
  "routing",
  "business_kernel",
  "business_kernel_ready",
  "plan_generating",
  "delta",
  "plan_validating",
  "tool_execution",
  "persisting",
  "complete",
  "error",
] as const;

interface SSEConnectOptions {
  onEvent: (event: SSEEvent) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
  afterEventId?: string;
  method?: "GET" | "POST";
  body?: unknown;
}

export interface SSEConnection {
  abort: () => void;
}

function buildSSEUrl(path: string, params?: Record<string, string>): string {
  const base = `${API_BASE_URL}/${API_VERSION}${path}`;
  if (!params || Object.keys(params).length === 0) return base;
  return `${base}?${new URLSearchParams(params).toString()}`;
}

function extractCookieValue(cookieHeader: string): string | null {
  const nameValue = cookieHeader.split(";")[0]?.trim() ?? "";
  const eqIdx = nameValue.indexOf("=");
  if (eqIdx === -1) return null;
  return nameValue.slice(eqIdx + 1).trim() || null;
}

async function ensureSessionCookieInJar(cookieHeader: string): Promise<void> {
  const value = extractCookieValue(cookieHeader);
  if (!value) return;
  await CookieManager.set(API_BASE_URL, {
    name: SESSION_COOKIE_NAME,
    value,
    path: "/",
    secure: true,
    httpOnly: true,
  });
}

function buildSSEEventSource(
  url: string,
  method: "GET" | "POST",
  headers: Record<string, string>,
  body: unknown,
): EventSource<(typeof SSE_EVENT_TYPES)[number]> {
  return new EventSource<(typeof SSE_EVENT_TYPES)[number]>(url, {
    headers,
    method,
    body:
      method === "POST" && body != null ? JSON.stringify(body) : undefined,
    pollingInterval: 0,
    withCredentials: true,
  });
}

function attachSSEListeners(
  es: EventSource<(typeof SSE_EVENT_TYPES)[number]>,
  options: SSEConnectOptions,
): void {
  for (const eventType of SSE_EVENT_TYPES) {
    es.addEventListener(eventType, (e) => {
      const typed = e as { data?: string | null; lastEventId?: string };
      options.onEvent({
        event: eventType,
        data: typed.data ?? "",
        id: typed.lastEventId ?? undefined,
      });
    });
  }

  es.addEventListener("error", (e) => {
    const typed = e as { type?: string; message?: string; xhrStatus?: number };
    if (typed.type === "close") {
      options.onDone?.();
    } else {
      options.onError?.(new Error(typed.message ?? "SSE connection error"));
    }
  });
}

export function connectSSE(
  path: string,
  options: SSEConnectOptions,
): SSEConnection {
  const method = options.method ?? "GET";

  const params: Record<string, string> = {};
  if (method === "GET" && options.afterEventId) {
    params["after_event_id"] = options.afterEventId;
  }
  const url = buildSSEUrl(path, params);
  const authHeaders = buildAuthHeaders();

  const headers: Record<string, string> = {};
  if (authHeaders["Authorization"]) {
    headers["Authorization"] = authHeaders["Authorization"];
  }
  if (method === "POST" && options.body != null) {
    headers["Content-Type"] = "application/json";
  }

  type ESInstance = EventSource<(typeof SSE_EVENT_TYPES)[number]>;
  const state: { es: ESInstance | null; aborted: boolean } = { es: null, aborted: false };

  const cookieHeader = authHeaders["Cookie"];
  const cookieReady = cookieHeader
    ? ensureSessionCookieInJar(cookieHeader)
    : Promise.resolve();

  void cookieReady.then(() => {
    if (state.aborted) return;
    state.es = buildSSEEventSource(url, method, headers, options.body);
    attachSSEListeners(state.es, options);
  });

  return {
    abort: () => {
      state.aborted = true;
      state.es?.close();
    },
  };
}
