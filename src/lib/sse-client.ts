import { API_BASE_URL, API_VERSION } from "@/constants/env";
import { buildAuthHeaders } from "@/lib/api-client";
import type { SSEEvent } from "@/utils/sse-parser";
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

function buildSSEEventSource(
  url: string,
  method: "GET" | "POST",
  headers: Record<string, string>,
  body: unknown,
): EventSource<(typeof SSE_EVENT_TYPES)[number]> {
  return new EventSource<(typeof SSE_EVENT_TYPES)[number]>(url, {
    headers,
    method,
    body: method === "POST" && body != null ? JSON.stringify(body) : undefined,
    pollingInterval: 0,
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

export function connectSSE(path: string, options: SSEConnectOptions): SSEConnection {
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
  if (authHeaders["Cookie"]) {
    headers["Cookie"] = authHeaders["Cookie"];
  }
  if (method === "POST" && options.body != null) {
    headers["Content-Type"] = "application/json";
  }

  type ESInstance = EventSource<(typeof SSE_EVENT_TYPES)[number]>;
  const state: { es: ESInstance | null; aborted: boolean } = { es: null, aborted: false };

  state.es = buildSSEEventSource(url, method, headers, options.body);
  attachSSEListeners(state.es, options);

  return {
    abort: () => {
      state.aborted = true;
      state.es?.close();
    },
  };
}
