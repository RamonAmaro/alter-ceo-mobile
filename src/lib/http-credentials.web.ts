// Web: browser manages cookies automatically via withCredentials.

type Getter = () => string | null;

let tokenGetter: Getter = () => null;

export function setAuthTokenGetter(getter: Getter): void {
  tokenGetter = getter;
}

export function setAuthCookieGetter(_getter: Getter): void {
  // No-op on web — browser sends cookies automatically.
}

export const WITH_CREDENTIALS = true;

export function buildAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = tokenGetter();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export function applyXHRCredentials(xhr: XMLHttpRequest): void {
  xhr.withCredentials = true;
}
