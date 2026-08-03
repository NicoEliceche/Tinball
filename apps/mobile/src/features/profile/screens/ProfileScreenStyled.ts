import { Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';
export const Header = styled(View)`align-items: center; gap: ${({ theme }) => theme.spacing.sm}px;`;
export const NameRow = styled(View)`flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.xs}px;`;
export const Name = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: ${({ theme }) => theme.typography.size.xxl}px;`;
export const Handle = styled(Text)`color: ${({ theme }) => theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;
export const Stats = styled(View)`flex-direction: row; gap: ${({ theme }) => theme.spacing.xs}px;`;
export const Stat = styled(View)`flex: 1; min-height: 82px; padding: ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.md}px; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; background-color: ${({ theme }) => theme.colors.surface}; justify-content: center; align-items: center;`;
export const StatValue = styled(Text)`color: ${({ theme }) => theme.colors.primary}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: ${({ theme }) => theme.typography.size.xl}px;`;
export const StatLabel = styled(Text)`color: ${({ theme }) => theme.colors.textMuted}; font-family: ${({ theme }) => theme.typography.family.medium}; font-size: ${({ theme }) => theme.typography.size.xs}px; text-align: center;`;
export const PositionCard = styled(View)`padding: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.lg}px; background-color: ${({ theme }) => theme.colors.surface}; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; gap: ${({ theme }) => theme.spacing.xs}px;`;
export const CardTitle = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.md}px;`;
export const CardText = styled(Text)`color: ${({ theme }) => theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;
export const Menu = styled(View)`border-radius: ${({ theme }) => theme.radius.lg}px; overflow: hidden; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; background-color: ${({ theme }) => theme.colors.surface};`;
export const MenuRow = styled(Pressable)<{ $danger?: boolean }>`min-height: 58px; padding: 0 ${({ theme }) => theme.spacing.md}px; flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px; border-bottom-width: 1px; border-bottom-color: ${({ theme }) => theme.colors.border};`;
export const MenuText = styled(Text)<{ $danger?: boolean }>`flex: 1; color: ${({ theme, $danger }) => $danger ? theme.colors.danger : theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.medium}; font-size: ${({ theme }) => theme.typography.size.md}px;`;
export const DemoBanner = styled(View)`padding: ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.infoMuted};`;
export const DemoText = styled(Text)`color: ${({ theme }) => theme.colors.info}; font-family: ${({ theme }) => theme.typography.family.medium}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;

