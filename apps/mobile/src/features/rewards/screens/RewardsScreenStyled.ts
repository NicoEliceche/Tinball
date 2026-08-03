import { FlatList, Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';
import type { Reward } from '../../../core/types/ranking.types';
export const Screen = styled(View)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
export const List = styled(FlatList<Reward>).attrs(({ theme }) => ({ contentContainerStyle: { padding: theme.spacing.md, paddingBottom: theme.spacing.hero, gap: theme.spacing.sm }, contentInsetAdjustmentBehavior: 'automatic' as const, showsVerticalScrollIndicator: false }))``;
export const Header = styled(View)`gap: ${({ theme }) => theme.spacing.sm}px; margin-bottom: ${({ theme }) => theme.spacing.sm}px;`;
export const Balance = styled(View)`padding: ${({ theme }) => theme.spacing.lg}px; border-radius: ${({ theme }) => theme.radius.xl}px; background-color: ${({ theme }) => theme.colors.primaryMuted}; border-width: 1px; border-color: ${({ theme }) => theme.colors.primaryBorder};`;
export const BalanceValue = styled(Text)`color: ${({ theme }) => theme.colors.primary}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: 42px;`;
export const Card = styled(Pressable)`padding: ${({ theme }) => theme.spacing.md}px; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radius.lg}px; background-color: ${({ theme }) => theme.colors.surface}; gap: ${({ theme }) => theme.spacing.xs}px;`;
export const Name = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.display}; font-size: ${({ theme }) => theme.typography.size.xl}px;`;
export const Sponsor = styled(Text)`color: ${({ theme }) => theme.colors.textMuted}; font-family: ${({ theme }) => theme.typography.family.medium}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;
export const Price = styled(Text)`color: ${({ theme }) => theme.colors.primary}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: ${({ theme }) => theme.typography.size.xl}px;`;

