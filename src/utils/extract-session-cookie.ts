import type { AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";

const SESSION_COOKIE_NAME = "alterceo_session";

type ResponseHeaders = AxiosResponseHeaders | RawAxiosResponseHeaders;

export function extractSessionCookie(headers: ResponseHeaders): string | null {
  const raw: unknown = headers["set-cookie"];

  const entries: string[] = Array.isArray(raw)
    ? (raw as string[])
    : typeof raw === "string" && raw
      ? raw.split(",")
      : [];

  for (const entry of entries) {
    const nameValue = entry.split(";")[0]?.trim() ?? "";
    if (nameValue.startsWith(`${SESSION_COOKIE_NAME}=`)) {
      return nameValue;
    }
  }

  return null;
}
