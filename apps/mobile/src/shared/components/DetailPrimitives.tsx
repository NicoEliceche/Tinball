import Ionicons from '@expo/vector-icons/Ionicons';
import type { PropsWithChildren } from 'react';
import { Pressable, Text, View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

export const Card = styled(View)`
  padding: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const HeroCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-color: ${({ theme }) => theme.colors.primaryBorder};
  background-color: ${({ theme }) => theme.colors.primaryMuted};
`;

export const ScreenTitle = styled(Text)`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family.displayExtra};
  font-size: ${({ theme }) => theme.typography.size.xxl}px;
`;

export const CardTitle = styled(Text)`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family.display};
  font-size: ${({ theme }) => theme.typography.size.xl}px;
`;

export const BodyText = styled(Text)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.family.body};
  font-size: ${({ theme }) => theme.typography.size.md}px;
  line-height: ${({ theme }) => theme.typography.size.md * theme.typography.lineHeight.normal}px;
`;

export const MetaText = styled(Text)`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.typography.family.medium};
  font-size: ${({ theme }) => theme.typography.size.sm}px;
`;

export const Row = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const WrapRow = styled(Row)`
  flex-wrap: wrap;
`;

export const BetweenRow = styled(Row)`
  justify-content: space-between;
`;

export const Flexible = styled(View)`
  flex: 1;
  gap: ${({ theme }) => theme.spacing.xxs}px;
`;

export const Metrics = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Metric = styled(View)`
  flex: 1;
  min-width: 92px;
  min-height: 76px;
  padding: ${({ theme }) => theme.spacing.sm}px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const MetricValue = styled(Text)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.family.displayExtra};
  font-size: ${({ theme }) => theme.typography.size.xl}px;
`;

export const MetricLabel = styled(Text)`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.typography.family.medium};
  font-size: ${({ theme }) => theme.typography.size.xs}px;
  text-align: center;
`;

const RowButton = styled(Pressable)`
  min-height: 58px;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const RowLabel = styled(Text)`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family.medium};
  font-size: ${({ theme }) => theme.typography.size.md}px;
`;

export function NavigationRow({ label, icon, onPress, children }: PropsWithChildren<{ label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }>) {
  const theme = useTheme();
  return (
    <RowButton accessibilityRole="button" accessibilityLabel={label} onPress={onPress}>
      <Ionicons name={icon} size={21} color={theme.colors.textSecondary} />
      <RowLabel>{label}</RowLabel>
      {children}
      <Ionicons name="chevron-forward" size={19} color={theme.colors.textMuted} />
    </RowButton>
  );
}

