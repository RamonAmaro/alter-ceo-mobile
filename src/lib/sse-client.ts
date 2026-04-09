import { API_BASE_URL, API_VERSION } from "@/constants/env";
import { buildAuthHeaders } from "@/lib/api-client";
import type { SSEEventType, SSETypedEvent } from "@/types/sse";
import { SSE_EVENT_TYPES } from "@/types/sse";
import { createSSEParser } from "@/utils/sse-parser";
import { Platform } from "react-native";

const KNOWN_EVENTS: ReadonlySet<string> = new Set<string>(SSE_EVENT_TYPES);

interface SSEConnectOptions {
  readonly onEvent: (event: SSETypedEvent) => void;
  readonly onDone?: () => void;
  readonly onError?: (error: Error) => void;
  readonly afterEventId?: string;
  readonly method?: "GET" | "POST";
  readonly body?: unknown;
}

export interface SSEConnection {
  readonly abort: () => void;
}

function buildSSEUrl(path: string, params?: Record<string, string>): string {
  const base = `${API_BASE_URL}/${API_VERSION}${path}`;
  if (!params || Object.keys(params).length === 0) return base;
  return `${base}?${new URLSearchParams(params).toString()}`;
}

function isKnownEvent(name: string | undefined): name is SSEEventType {
  return name != null && KNOWN_EVENTS.has(name);
}

export function connectSSE(path: string, options: SSEConnectOptions): SSEConnection {
  const method = options.method ?? "GET";

  const params: Record<string, string> = {};
  if (method === "GET" && options.afterEventId) {
    params["after_event_id"] = options.afterEventId;
  }
  const url = buildSSEUrl(path, params);
  const authHeaders = buildAuthHeaders();

  const headers: Record<string, string> = {
    Accept: "text/event-stream",
    "Cache-Control": "no-cache",
  };
  if (authHeaders["Authorization"]) {
    headers["Authorization"] = authHeaders["Authorization"];
  }
  if (authHeaders["Cookie"]) {
    headers["Cookie"] = authHeaders["Cookie"];
  }
  if (method === "POST" && options.body != null) {
    headers["Content-Type"] = "application/json";
  }

  const xhr = new XMLHttpRequest();
  let lastProcessedIndex = 0;
  let aborted = false;

  const parser = createSSEParser((raw) => {
    if (aborted) return;
    if (!isKnownEvent(raw.event)) return;
    options.onEvent({ id: raw.id, event: raw.event, data: raw.data });
  });

  xhr.open(method, url, true);
  if (Platform.OS === "web") xhr.withCredentials = true;
  for (const [key, value] of Object.entries(headers)) {
    xhr.setRequestHeader(key, value);
  }

  xhr.onreadystatechange = () => {
    if (aborted) return;

    if (xhr.readyState !== XMLHttpRequest.LOADING && xhr.readyState !== XMLHttpRequest.DONE) {
      return;
    }

    if (xhr.status >= 200 && xhr.status < 400) {
      const text = xhr.responseText ?? "";
      if (text.length > lastProcessedIndex) {
        parser.push(text.slice(lastProcessedIndex));
        lastProcessedIndex = text.length;
      }

      if (xhr.readyState === XMLHttpRequest.DONE) {
        parser.flush();
        options.onDone?.();
      }
    } else if (xhr.status !== 0 && xhr.readyState === XMLHttpRequest.DONE) {
      options.onError?.(new Error(`SSE HTTP ${xhr.status}`));
    }
  };

  xhr.onerror = () => {
    if (aborted) return;
    options.onError?.(new Error("SSE connection error"));
  };

  xhr.ontimeout = () => {
    if (aborted) return;
    options.onError?.(new Error("SSE connection timeout"));
  };

  if (method === "POST" && options.body != null) {
    xhr.send(JSON.stringify(options.body));
  } else {
    xhr.send();
  }

  return {
    abort: () => {
      aborted = true;
      xhr.abort();
    },
  };
}
