import { Platform } from 'react-native';
import type { AuthResponse, AuthUser, Platform as AuthPlatform } from '@tinball/contracts';
import { apiRequest } from '../client/apiClient';
import { clearStoredSessionToken, storeSessionToken } from './authTokenStorage';

function currentPlatform(): AuthPlatform {
  if (Platform.OS === 'android' || Platform.OS === 'ios' || Platform.OS === 'web') return Platform.OS;
  return 'web';
}

export async function loginWithGoogleIdToken(idToken: string): Promise<AuthResponse> {
  const auth = await apiRequest<AuthResponse>('/api/v1/auth/google', {
    method: 'POST',
    body: { idToken, platform: currentPlatform(), deviceName: `${Platform.OS} Tinball` },
  });
  if (Platform.OS !== 'web') {
    if (!auth.sessionToken) throw new Error('El servidor no devolvió una sesión nativa.');
    await storeSessionToken(auth.sessionToken);
  }
  return auth;
}

export async function restoreAuthSession(): Promise<AuthResponse | null> {
  try {
    return await apiRequest<AuthResponse>('/api/v1/auth/me', { method: 'GET', timeoutMs: 8_000 });
  } catch {
    return null;
  }
}

export async function logoutSession(): Promise<void> {
  await apiRequest<void>('/api/v1/auth/logout', { method: 'POST' }).catch(() => undefined);
  await clearStoredSessionToken();
}

export async function completeProfile(input: unknown): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/v1/profile/onboarding', { method: 'PUT', body: input });
}

