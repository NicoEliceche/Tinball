// Web sessions live exclusively in Secure + HttpOnly + SameSite cookies.
// JavaScript never receives or persists browser credentials.
export async function getStoredSessionToken(): Promise<null> { return null; }
export async function storeSessionToken(_token: string): Promise<void> { return; }
export async function clearStoredSessionToken(): Promise<void> { return; }

