// Native: cookies are managed manually via headers (no browser cookie jar).

type Getter = () => string | null;

let tokenGetter: Getter = () => null;
let cookieGetter: Getter = () => null;

export function setAuthTokenGetter(getter: Getter): void {
  tokenGetter = getter;
}

export function setAuthCookieGetter(getter: Getter): void {
  cookieGetter = getter;
}

export const WITH_CREDENTIALS = false;

export function buildAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = tokenGetter();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const cookie = cookieGetter();
  if (cookie) headers["Cookie"] = cookie;
  return headers;
}

export function applyXHRCredentials(_xhr: XMLHttpRequest): void {
  // No-op on native — cookies are sent via headers.
}
