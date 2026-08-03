import type { AuthResponse, AuthUser } from '@tinball/contracts';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { completeProfile, loginWithGoogleIdToken, logoutSession, restoreAuthSession } from '../data/services/authService';
import { signOutFromGoogle } from '../../features/auth/services/useGoogleSignIn';
import { useTinballStore } from '../store/useTinballStore';

interface AuthContextValue {
  auth: AuthResponse | null;
  status: 'RESTORING' | 'ANONYMOUS' | 'AUTHENTICATED';
  isDemo: boolean;
  loginWithGoogle: (idToken: string) => Promise<void>;
  enterDemo: () => void;
  logout: () => Promise<void>;
  finishOnboarding: (input: unknown) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const demoUser: AuthUser = {
  id: 'demo-user',
  email: 'demo@tinball.app',
  displayName: 'Nico E.',
  avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=320&auto=format&fit=crop',
  onboardingComplete: true,
  isPremium: true,
  role: 'PLAYER',
  accountStatus: 'ACTIVE',
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [status, setStatus] = useState<AuthContextValue['status']>('RESTORING');
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    let active = true;
    restoreAuthSession().then((session) => {
      if (!active) return;
      setAuth(session);
      setStatus(session ? 'AUTHENTICATED' : 'ANONYMOUS');
    });
    return () => { active = false; };
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const session = await loginWithGoogleIdToken(idToken);
    useTinballStore.getState().clearData();
    setAuth(session);
    setIsDemo(false);
    setStatus('AUTHENTICATED');
  }, []);

  const enterDemo = useCallback(() => {
    if (!__DEV__ || process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE !== 'true') return;
    useTinballStore.getState().loadDemoData();
    setAuth({ user: demoUser, platform: 'web', expiresAt: new Date(Date.now() + 3_600_000).toISOString() });
    setIsDemo(true);
    setStatus('AUTHENTICATED');
  }, []);

  const logout = useCallback(async () => {
    if (!isDemo) await Promise.all([logoutSession(), signOutFromGoogle()]);
    setAuth(null);
    setIsDemo(false);
    setStatus('ANONYMOUS');
    useTinballStore.getState().clearData();
  }, [isDemo]);

  const finishOnboarding = useCallback(async (input: unknown) => {
    if (!auth) return;
    const user = isDemo ? { ...auth.user, onboardingComplete: true } : await completeProfile(input);
    setAuth({ ...auth, user });
  }, [auth, isDemo]);

  const value = useMemo(() => ({ auth, status, isDemo, loginWithGoogle, enterDemo, logout, finishOnboarding }), [auth, enterDemo, finishOnboarding, isDemo, loginWithGoogle, logout, status]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
