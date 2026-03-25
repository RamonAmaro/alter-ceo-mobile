import { API_BASE_URL, API_TIMEOUT, API_VERSION } from "@/constants/api";
import { ApiError, type ValidationError } from "@/types/api";

type TokenGetter = () => string | null;
let tokenGetter: TokenGetter = () => null;

export function setAuthTokenGetter(getter: TokenGetter): void {
  tokenGetter = getter;
}

type CookieGetter = () => string | null;
let cookieGetter: CookieGetter = () => null;

export function setAuthCookieGetter(getter: CookieGetter): void {
  cookieGetter = getter;
}

function makeAbortSignal(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

function buildUrl(path: string, params?: Record<string, string>): string {
  const base = `${API_BASE_URL}/${API_VERSION}${path}`;
  if (!params || Object.keys(params).length === 0) return base;
  return `${base}?${new URLSearchParams(params).toString()}`;
}

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = tokenGetter();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const cookie = cookieGetter();
  if (cookie) {
    headers["Cookie"] = cookie;
  }
  return headers;
}

async function throwIfNotOk(response: Response): Promise<void> {
  if (response.ok) return;

  const raw = await response.text();
  let message = `HTTP ${response.status}`;
  let validationErrors: ValidationError[] | undefined;

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.detail === "string") {
      message = parsed.detail;
    } else if (Array.isArray(parsed.detail)) {
      message = parsed.detail[0]?.msg ?? message;
      validationErrors = parsed.detail;
    } else {
      message = parsed.message ?? message;
    }
  } catch {
    if (raw) message = raw;
  }

  throw new ApiError(response.status, message, validationErrors);
}

export async function get<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    method: "GET",
    headers: baseHeaders(),
    signal: makeAbortSignal(API_TIMEOUT),
  });

  await throwIfNotOk(response);
  return response.json() as Promise<T>;
}

export async function getRaw(
  path: string,
  params?: Record<string, string>,
): Promise<Response> {
  const response = await fetch(buildUrl(path, params), {
    method: "GET",
    headers: baseHeaders(),
    signal: makeAbortSignal(API_TIMEOUT),
  });

  await throwIfNotOk(response);
  return response;
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...baseHeaders() },
    body: body != null ? JSON.stringify(body) : undefined,
    signal: makeAbortSignal(API_TIMEOUT),
  });

  await throwIfNotOk(response);
  return response.json() as Promise<T>;
}

export async function postRaw(
  path: string,
  body?: unknown,
): Promise<Response> {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...baseHeaders() },
    body: body != null ? JSON.stringify(body) : undefined,
    signal: makeAbortSignal(API_TIMEOUT),
  });

  await throwIfNotOk(response);
  return response;
}

export async function postFormData<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: baseHeaders(),
    body: formData,
    signal: makeAbortSignal(API_TIMEOUT),
  });

  await throwIfNotOk(response);
  return response.json() as Promise<T>;
}

export async function putRaw(
  url: string,
  body: Blob | ArrayBuffer,
  headers: Record<string, string>,
): Promise<void> {
  const response = await fetch(url, {
    method: "PUT",
    headers,
    body,
    signal: makeAbortSignal(API_TIMEOUT * 4),
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Upload failed with status ${response.status}`,
    );
  }
}
