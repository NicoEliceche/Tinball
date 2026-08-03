import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, Text, View } from 'react-native';
import styled from 'styled-components/native';

export const Screen = styled(View)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Background = styled(LinearGradient).attrs(({ theme }) => ({
  colors: [theme.colors.background, theme.colors.backgroundAlt, theme.colors.surface],
  start: { x: 0.1, y: 0 },
  end: { x: 1, y: 1 },
}))`
  position: absolute;
  inset: 0;
`;

export const Scroll = styled(ScrollView).attrs({
  showsVerticalScrollIndicator: false,
  keyboardShouldPersistTaps: 'handled' as const,
})``;

export const Content = styled(View)<{ $top: number; $bottom: number; $landscape: boolean }>`
  width: 100%;
  max-width: ${({ theme, $landscape }) => $landscape ? theme.layout.maxDashboardWidth : 520}px;
  min-height: 100%;
  align-self: center;
  padding-top: ${({ $top }) => $top}px;
  padding-right: ${({ theme }) => theme.spacing.lg}px;
  padding-bottom: ${({ $bottom }) => $bottom}px;
  padding-left: ${({ theme }) => theme.spacing.lg}px;
  gap: ${({ theme }) => theme.spacing.xl}px;
  justify-content: center;
`;

export const Hero = styled(View)<{ $landscape: boolean }>`
  flex-direction: ${({ $landscape }) => $landscape ? 'row' : 'column'};
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const HeroCopy = styled(View)`
  flex-shrink: 1;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const Kicker = styled(Text)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.family.bold};
  font-size: ${({ theme }) => theme.typography.size.xs}px;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-align: center;
`;

export const Title = styled(Text)`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family.displayExtra};
  font-size: ${({ theme }) => theme.typography.size.hero}px;
  line-height: ${({ theme }) => theme.typography.size.hero * theme.typography.lineHeight.tight}px;
  text-align: center;
`;

export const Subtitle = styled(Text)`
  max-width: 390px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.family.body};
  font-size: ${({ theme }) => theme.typography.size.md}px;
  line-height: ${({ theme }) => theme.typography.size.md * theme.typography.lineHeight.normal}px;
  text-align: center;
`;

export const AuthCard = styled(View)`
  width: 100%;
  max-width: 470px;
  align-self: center;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-radius: ${({ theme }) => theme.radius.xl}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surfaceOverlay};
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const CardTitle = styled(Text)`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family.display};
  font-size: ${({ theme }) => theme.typography.size.xl}px;
`;

export const CardText = styled(Text)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.family.body};
  font-size: ${({ theme }) => theme.typography.size.sm}px;
  line-height: ${({ theme }) => theme.typography.size.sm * theme.typography.lineHeight.normal}px;
`;

export const ErrorBox = styled(View)`
  padding: ${({ theme }) => theme.spacing.sm}px;
  border-left-width: 3px;
  border-left-color: ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background-color: ${({ theme }) => theme.colors.dangerMuted};
`;

export const ErrorText = styled(Text)`
  color: ${({ theme }) => theme.colors.danger};
  font-family: ${({ theme }) => theme.typography.family.medium};
  font-size: ${({ theme }) => theme.typography.size.sm}px;
`;

export const DemoButton = styled(Pressable)`
  min-height: 48px;
  align-items: center;
  justify-content: center;
`;

export const DemoText = styled(Text)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.family.semibold};
  font-size: ${({ theme }) => theme.typography.size.sm}px;
  text-decoration-line: underline;
`;

export const LegalText = styled(Text)`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.typography.family.body};
  font-size: ${({ theme }) => theme.typography.size.xs}px;
  line-height: ${({ theme }) => theme.typography.size.xs * theme.typography.lineHeight.normal}px;
  text-align: center;
`;

export const LegalLink = styled(Text)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.family.semibold};
  text-decoration-line: underline;
`;
