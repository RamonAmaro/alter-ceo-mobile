import { API_BASE_URL, API_TIMEOUT, API_VERSION } from "@/constants/env";
import { ApiError, type ValidationError } from "@/types/api";
import axios, { isAxiosError } from "axios";
import { Platform } from "react-native";

const IS_WEB = Platform.OS === "web";

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

export function buildAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = tokenGetter();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!IS_WEB) {
    const cookie = cookieGetter();
    if (cookie) headers["Cookie"] = cookie;
  }
  return headers;
}

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/${API_VERSION}`,
  timeout: API_TIMEOUT,
  withCredentials: IS_WEB,
});

apiClient.interceptors.request.use((config) => {
  const authHeaders = buildAuthHeaders();
  Object.assign(config.headers, authHeaders);
  return config;
});

export function handleAxiosError(err: unknown): never {
  if (isAxiosError(err) && err.response) {
    const data = err.response.data as Record<string, unknown> | string | undefined;
    let message = `HTTP ${err.response.status}`;
    let validationErrors: ValidationError[] | undefined;

    if (typeof data === "object" && data !== null) {
      if (typeof data.detail === "string") {
        message = data.detail;
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

export async function postFormData<T>(path: string, formData: FormData): Promise<T> {
  try {
    const response = await apiClient.post<T>(path, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
