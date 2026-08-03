import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';
import { AuthProvider, useAuth } from './src/core/providers/AuthProvider';
import { useProductBootstrap } from './src/core/data/services/useProductBootstrap';
import { AppThemeProvider, useThemePreferences } from './src/core/providers/AppThemeProvider';
import { useTinballStore } from './src/core/store/useTinballStore';
import { FontBootstrap } from './src/core/providers/FontBootstrap';
import { LoginScreen, OnboardingScreen, SuspendedAccountScreen } from './src/features/auth';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorState, LoadingScreen } from './src/shared/components/ScreenState';

SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({ duration: 220, fade: true });

const Root = styled(GestureHandlerRootView)`flex: 1;`;
const AppSurface = styled(View)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;

function AppFlow() {
  const { auth, status, isDemo } = useAuth(); const theme = useTheme();
  const themePreferences = useThemePreferences();
  const storedThemeMode = useTinballStore((state) => state.settings.themeMode);
  const dataStatus = useTinballStore((state) => state.dataStatus);
  const dataError = useTinballStore((state) => state.dataError);
  const clearData = useTinballStore((state) => state.clearData);
  useProductBootstrap(status === 'AUTHENTICATED' && Boolean(auth?.user.onboardingComplete) && auth?.user.accountStatus === 'ACTIVE' && !isDemo);
  useEffect(() => { if (dataStatus === 'READY' && themePreferences.mode !== storedThemeMode) themePreferences.setMode(storedThemeMode); }, [dataStatus, storedThemeMode, themePreferences]);
  useEffect(() => { if (status !== 'RESTORING') SplashScreen.hideAsync().catch(() => undefined); }, [status]);
  const needsProductData = status === 'AUTHENTICATED' && auth?.user.accountStatus === 'ACTIVE' && Boolean(auth.user.onboardingComplete) && !isDemo;
  return <AppSurface><StatusBar style={theme.dark ? 'light' : 'dark'} />{status === 'RESTORING' ? <LoadingScreen /> : status === 'ANONYMOUS' ? <LoginScreen /> : auth?.user.accountStatus === 'SUSPENDED' ? <SuspendedAccountScreen /> : auth && !auth.user.onboardingComplete ? <OnboardingScreen /> : needsProductData && dataStatus === 'ERROR' ? <ErrorState message={dataError ?? 'Revisá tu conexión e intentá nuevamente.'} onRetry={clearData} /> : needsProductData && dataStatus !== 'READY' ? <LoadingScreen message="Cargando tu vestuario…" /> : <AppNavigator />}</AppSurface>;
}

export default function App() {
  return <Root><SafeAreaProvider><AppThemeProvider><FontBootstrap><AuthProvider><AppFlow /></AuthProvider></FontBootstrap></AppThemeProvider></SafeAreaProvider></Root>;
}
