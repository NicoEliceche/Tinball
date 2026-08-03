import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useCallback } from 'react';
import { Platform } from 'react-native';

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
let configured = false;

function getConfigurationError(): string | null {
  if (!webClientId) return 'Falta EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.';
  if (Platform.OS === 'android' && !androidClientId) return 'Falta EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID.';
  if (Platform.OS === 'ios' && !iosClientId) return 'Falta EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID.';
  return null;
}

export function useGoogleSignIn() {
  const configurationError = getConfigurationError();
  const signIn = useCallback(async (): Promise<string | null> => {
    if (configurationError) throw new Error(configurationError);
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
      throw new Error('Google Sign-In requiere la development build de Tinball; no funciona dentro de Expo Go.');
    }

    const googleModule = await import('@react-native-google-signin/google-signin');
    if (!configured) {
      googleModule.GoogleSignin.configure({ webClientId, iosClientId, offlineAccess: false, profileImageSize: 240 });
      configured = true;
    }
    if (Platform.OS === 'android') await googleModule.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await googleModule.GoogleSignin.signIn();
    if (googleModule.isCancelledResponse(response)) return null;
    const compatible = response as unknown as { data?: { idToken?: string | null }; idToken?: string | null };
    const idToken = compatible.data?.idToken ?? compatible.idToken ?? null;
    if (!idToken) throw new Error('Google no devolvió una credencial verificable.');
    return idToken;
  }, [configurationError]);

  return { configurationError, ready: !configurationError, signIn };
}

export async function signOutFromGoogle(): Promise<void> {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return;
  const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
  await GoogleSignin.signOut().catch(() => undefined);
}

