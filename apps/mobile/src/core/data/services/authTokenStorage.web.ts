const SESSION_TOKEN_KEY = 'tinball_session_token';

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export async function getStoredSessionToken(): Promise<string | null> {
  try {
    return getStorage()?.getItem(SESSION_TOKEN_KEY) ?? null;
  } catch {
    return null;
  }
}

export async function storeSessionToken(token: string): Promise<void> {
  try {
    getStorage()?.setItem(SESSION_TOKEN_KEY, token);
  } catch {
    return;
  }
}

export async function clearStoredSessionToken(): Promise<void> {
  try {
    getStorage()?.removeItem(SESSION_TOKEN_KEY);
  } catch {
    return;
  }
}
