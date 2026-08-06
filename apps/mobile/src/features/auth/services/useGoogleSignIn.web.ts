import { ResponseType } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';

WebBrowser.maybeCompleteAuthSession();

const redirectUriOptions = process.env.EXPO_PUBLIC_BASE_PATH
  ? { path: process.env.EXPO_PUBLIC_BASE_PATH }
  : {};

export function useGoogleSignIn() {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const configurationError = webClientId ? null : 'Falta EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.';
  const [request, , promptAsync] = Google.useAuthRequest({
    // Expo validates this option while the hook renders. A harmless placeholder
    // keeps the configuration screen usable before deployment secrets exist.
    webClientId: webClientId ?? 'tinball-not-configured.apps.googleusercontent.com',
    responseType: ResponseType.IdToken,
    scopes: ['openid', 'profile', 'email'],
    selectAccount: true,
  }, redirectUriOptions);
  const signIn = useCallback(async (): Promise<string | null> => {
    if (configurationError) throw new Error(configurationError);
    const result = await promptAsync();
    if (result.type !== 'success') return null;
    const idToken = result.params.id_token;
    if (!idToken) throw new Error('Google no devolvió una credencial verificable.');
    return idToken;
  }, [configurationError, promptAsync]);
  return { configurationError, ready: Boolean(request) && !configurationError, signIn };
}

export async function signOutFromGoogle(): Promise<void> {}
