export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  hero: 48,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
} as const;

export const typography = {
  family: {
    body: 'Barlow_400Regular',
    medium: 'Barlow_500Medium',
    semibold: 'Barlow_600SemiBold',
    bold: 'Barlow_700Bold',
    display: 'BarlowCondensed_700Bold',
    displayExtra: 'BarlowCondensed_800ExtraBold',
  },
  size: { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28, hero: 36 },
  lineHeight: { tight: 1.1, normal: 1.45, relaxed: 1.6 },
} as const;

export const layout = {
  maxContentWidth: 720,
  maxDashboardWidth: 1180,
  screenGutter: 16,
  touchTarget: 48,
  tabBarHeight: 70,
} as const;

export const motion = {
  quick: 160,
  standard: 220,
  deliberate: 300,
} as const;

const darkColors = {
  primary: '#2FD05A',
  primaryStrong: '#20A947',
  primaryMuted: 'rgba(47, 208, 90, 0.14)',
  primaryBorder: 'rgba(47, 208, 90, 0.34)',
  onPrimary: '#061109',
  background: '#07090C',
  backgroundAlt: '#0B0F13',
  surface: '#11151A',
  surfaceElevated: '#191F25',
  surfacePressed: '#222A31',
  surfaceOverlay: 'rgba(7, 9, 12, 0.88)',
  border: '#2B3530',
  borderStrong: '#415047',
  text: '#F7FAF7',
  textSecondary: '#B7C1B9',
  textMuted: '#839087',
  textInverse: '#101612',
  info: '#5DA9FF',
  infoMuted: 'rgba(93, 169, 255, 0.15)',
  warning: '#F7C948',
  warningMuted: 'rgba(247, 201, 72, 0.15)',
  danger: '#FF5C6C',
  dangerMuted: 'rgba(255, 92, 108, 0.14)',
  success: '#66E58B',
  overlay: 'rgba(0, 0, 0, 0.62)',
  shadow: '#000000',
  football: '#F7FAF7',
} as const;

const lightColors: Record<keyof typeof darkColors, string> = {
  primary: '#157A35',
  primaryStrong: '#0E5B27',
  primaryMuted: 'rgba(21, 122, 53, 0.12)',
  primaryBorder: 'rgba(21, 122, 53, 0.28)',
  onPrimary: '#FFFFFF',
  background: '#F4F7F3',
  backgroundAlt: '#EAF0E9',
  surface: '#FFFFFF',
  surfaceElevated: '#F8FBF7',
  surfacePressed: '#E1E9E1',
  surfaceOverlay: 'rgba(255, 255, 255, 0.92)',
  border: '#CED9D0',
  borderStrong: '#A9B9AC',
  text: '#101612',
  textSecondary: '#4C5C50',
  textMuted: '#6E7D71',
  textInverse: '#FFFFFF',
  info: '#1769AA',
  infoMuted: 'rgba(23, 105, 170, 0.1)',
  warning: '#8A5A00',
  warningMuted: 'rgba(138, 90, 0, 0.1)',
  danger: '#B42335',
  dangerMuted: 'rgba(180, 35, 53, 0.1)',
  success: '#14783A',
  overlay: 'rgba(10, 18, 12, 0.55)',
  shadow: '#152419',
  football: '#101612',
};

export type ThemeMode = 'system' | 'dark' | 'light';
export type ResolvedThemeMode = Exclude<ThemeMode, 'system'>;

export interface TinballTheme {
  dark: boolean;
  mode: ResolvedThemeMode;
  colors: Record<keyof typeof darkColors, string>;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  layout: typeof layout;
  motion: typeof motion;
}

export function createTheme(mode: ResolvedThemeMode): TinballTheme {
  return {
    dark: mode === 'dark',
    mode,
    colors: mode === 'dark' ? darkColors : lightColors,
    spacing,
    radius,
    typography,
    layout,
    motion,
  };
}

export const darkTheme = createTheme('dark');
export const lightTheme = createTheme('light');

