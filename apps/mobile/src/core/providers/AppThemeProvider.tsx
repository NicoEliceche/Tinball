import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeProvider } from 'styled-components/native';
import { createTheme, type ResolvedThemeMode, type ThemeMode } from '../theme/tokens';

interface ThemePreferences {
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemePreferencesContext = createContext<ThemePreferences | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemMode = useColorScheme() === 'light' ? 'light' : 'dark';
  const [mode, setMode] = useState<ThemeMode>('dark');
  const resolvedMode: ResolvedThemeMode = mode === 'system' ? systemMode : mode;
  const theme = useMemo(() => createTheme(resolvedMode), [resolvedMode]);
  const value = useMemo(() => ({ mode, resolvedMode, setMode }), [mode, resolvedMode]);

  return (
    <ThemePreferencesContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemePreferencesContext.Provider>
  );
}

export function useThemePreferences(): ThemePreferences {
  const value = useContext(ThemePreferencesContext);
  if (!value) throw new Error('useThemePreferences must be used inside AppThemeProvider');
  return value;
}

