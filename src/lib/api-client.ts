import { API_BASE_URL, API_TIMEOUT, API_VERSION } from "@/constants/env";
import { buildAuthHeaders, WITH_CREDENTIALS } from "@/lib/http-credentials";
import { ApiError, type ValidationError } from "@/types/api";
import axios, { isAxiosError, type AxiosResponse } from "axios";

export { setAuthCookieGetter, setAuthTokenGetter } from "@/lib/http-credentials";
export { buildAuthHeaders };

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/${API_VERSION}`,
  timeout: API_TIMEOUT,
  withCredentials: WITH_CREDENTIALS,
});

apiClient.interceptors.request.use((config) => {
  const authHeaders = buildAuthHeaders();
  Object.assign(config.headers, authHeaders);
  return config;
});

// ─── 401 interceptor: force sign-out on unauthorized responses ───────────────

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setOnUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorized = handler;
}

const AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/session", "/auth/logout"];

function isAuthPath(url: string | undefined): boolean {
  return AUTH_PATHS.some((p) => url?.endsWith(p));
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401 && !isAuthPath(error.config?.url)) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export function handleAxiosError(err: unknown): never {
  if (isAxiosError(err) && err.response) {
    const data = err.response.data as Record<string, unknown> | string | undefined;
    let message = `HTTP ${err.response.status}`;
    let validationErrors: ValidationError[] | undefined;

    if (typeof data === "object" && data !== null) {
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (
        typeof data.detail === "object" &&
        data.detail !== null &&
        typeof (data.detail as Record<string, unknown>).message === "string"
      ) {
        message = (data.detail as Record<string, unknown>).message as string;
      } else if (Array.isArray(data.detail)) {
        message = (data.detail[0] as ValidationError)?.msg ?? message;
        validationErrors = data.detail as ValidationError[];
      } else if (typeof data.message === "string") {
        message = data.message;
      }
    } else if (typeof data === "string" && data) {
      message = data;
    }

    throw new ApiError(err.response.status, message, validationErrors);
  }
  throw err;
}

function buildUrl(path: string, params?: Record<string, string>): string {
  return params && Object.keys(params).length > 0
    ? `${path}?${new URLSearchParams(params).toString()}`
    : path;
}

export async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  try {
    const response = await apiClient.get<T>(buildUrl(path, params));
    return response.data;
  } catch (err) {
    return handleAxiosError(err);
  }
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  try {
    const response = await apiClient.post<T>(path, body);
    return response.data;
  } catch (err) {
    return handleAxiosError(err);
  }
}

export async function patch<T>(path: string, body?: unknown): Promise<T> {
  try {
    const response = await apiClient.patch<T>(path, body);
    return response.data;
  } catch (err) {
    return handleAxiosError(err);
  }
}

export async function postFormData<T>(path: string, formData: FormData): Promise<T> {
  try {
    // Do not set Content-Type: axios/fetch generates the multipart boundary automatically.
    const response = await apiClient.post<T>(path, formData);
    return response.data;
  } catch (err) {
    return handleAxiosError(err);
  }
}

export async function putExternal(
  url: string,
  body: Blob | ArrayBuffer,
  headers: Record<string, string>,
): Promise<void> {
  try {
    await axios.put(url, body, {
      headers,
      timeout: API_TIMEOUT * 4,
    });
  } catch (err) {
    if (isAxiosError(err) && err.response) {
      throw new ApiError(err.response.status, `Upload failed with status ${err.response.status}`);
    }
    throw err;
  }
}
