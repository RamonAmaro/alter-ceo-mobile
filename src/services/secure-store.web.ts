// Safari in Private Browsing and some iOS contexts throw on localStorage
// access (QuotaExceededError / SecurityError). Swallow those failures so the
// auth flow doesn't crash — the app will fall back to the browser cookie jar.
export async function getItemAsync(key: string): Promise<string | null> {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  try {
    localStorage.setItem(key, value);
  } catch {
    // best-effort
  }
}

export async function deleteItemAsync(key: string): Promise<void> {
  try {
    localStorage.removeItem(key);
  } catch {
    // best-effort
  }
}
