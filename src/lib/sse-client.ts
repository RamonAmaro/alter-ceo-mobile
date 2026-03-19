import { API_BASE_URL, API_VERSION } from "@/constants/api";
import { ApiError } from "@/types/api";
import { createSSEParser, type SSEEvent } from "@/utils/sse-parser";

interface SSEConnectOptions {
  onEvent: (event: SSEEvent) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
  afterEventId?: string;
  method?: "GET" | "POST";
  body?: unknown;
  token?: string | null;
}

export interface SSEConnection {
  abort: () => void;
}

function buildSSEUrl(path: string, params?: Record<string, string>): string {
  const base = `${API_BASE_URL}/${API_VERSION}${path}`;
  if (!params || Object.keys(params).length === 0) return base;
  return `${base}?${new URLSearchParams(params).toString()}`;
}

export function connectSSE(
  path: string,
  options: SSEConnectOptions,
): SSEConnection {
  const controller = new AbortController();
  const method = options.method ?? "GET";

  const params: Record<string, string> = {};
  if (method === "GET" && options.afterEventId) {
    params["after_event_id"] = options.afterEventId;
  }
  const url = buildSSEUrl(path, params);

  const headers: Record<string, string> = { Accept: "text/event-stream" };
  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }
  if (method === "POST" && options.body != null) {
    headers["Content-Type"] = "application/json";
  }

  consumeStream(url, {
    method,
    headers,
    body:
      method === "POST" && options.body != null
        ? JSON.stringify(options.body)
        : undefined,
    signal: controller.signal,
    onEvent: options.onEvent,
    onDone: options.onDone,
    onError: options.onError,
  });

  return { abort: () => controller.abort() };
}

interface ConsumeOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
  signal: AbortSignal;
  onEvent: (event: SSEEvent) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

async function consumeStream(url: string, opts: ConsumeOptions): Promise<void> {
  try {
    const response = await fetch(url, {
      method: opts.method,
      headers: opts.headers,
      body: opts.body,
      signal: opts.signal,
    });

    if (!response.ok) {
      throw new ApiError(response.status, `SSE connection failed`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      opts.onDone?.();
      return;
    }

    const decoder = new TextDecoder();
    const parser = createSSEParser(opts.onEvent);

    let reading = true;
    while (reading) {
      const { done, value } = await reader.read();
      if (done) {
        reading = false;
        break;
      }
      parser.push(decoder.decode(value, { stream: true }));
    }

    opts.onDone?.();
  } catch (error) {
    if ((error as Error).name === "AbortError") return;
    opts.onError?.(error as Error);
  }
}
