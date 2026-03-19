import { API_BASE_URL, API_TIMEOUT, API_VERSION } from "@/constants/api";
import { ApiError, type ValidationError } from "@/types/api";

type TokenGetter = () => string | null;
let tokenGetter: TokenGetter = () => null;

export function setAuthTokenGetter(getter: TokenGetter): void {
  tokenGetter = getter;
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
  return headers;
}

async function throwIfNotOk(response: Response): Promise<void> {
  if (response.ok) return;

  const raw = await response.text();
  let message = `HTTP ${response.status}`;
  let validationErrors: ValidationError[] | undefined;

  try {
    const parsed = JSON.parse(raw);
    message = parsed.detail?.[0]?.msg ?? parsed.message ?? message;
    validationErrors = Array.isArray(parsed.detail)
      ? parsed.detail
      : undefined;
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
    signal: AbortSignal.timeout(API_TIMEOUT),
  });

  await throwIfNotOk(response);
  return response.json() as Promise<T>;
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...baseHeaders() },
    body: body != null ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(API_TIMEOUT),
  });

  await throwIfNotOk(response);
  return response.json() as Promise<T>;
}

export async function postFormData<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: baseHeaders(),
    body: formData,
    signal: AbortSignal.timeout(API_TIMEOUT),
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
    signal: AbortSignal.timeout(API_TIMEOUT * 4),
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Upload failed with status ${response.status}`,
    );
  }
}
