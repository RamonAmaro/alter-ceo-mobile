export function extractSessionCookie(headers: Headers): string | null {
  const setCookie = headers.get("set-cookie");
  if (!setCookie) return null;
  const parts = setCookie.split(";");
  return parts[0]?.trim() ?? null;
}
