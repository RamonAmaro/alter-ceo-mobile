export const SESSION_COOKIE_KEY = "alterceo_session_cookie";

export interface AuthSession {
  userId: string;
  email: string | null;
  displayName: string | null;
  roles: string[];
}
