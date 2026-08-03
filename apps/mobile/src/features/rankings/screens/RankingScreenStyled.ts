import { FlatList, Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';
import type { RankingEntry } from '../../../core/types/ranking.types';
export const Screen = styled(View)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
export const List = styled(FlatList<RankingEntry>).attrs(({ theme }) => ({ contentContainerStyle: { padding: theme.spacing.md, paddingBottom: theme.spacing.hero, gap: theme.spacing.xs }, contentInsetAdjustmentBehavior: 'automatic' as const, showsVerticalScrollIndicator: false }))``;
export const Header = styled(View)`gap: ${({ theme }) => theme.spacing.lg}px; margin-bottom: ${({ theme }) => theme.spacing.sm}px;`;
export const Title = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: ${({ theme }) => theme.typography.size.xxl}px;`;
export const Copy = styled(Text)`color: ${({ theme }) => theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.sm}px; line-height: ${({ theme }) => theme.typography.size.sm * theme.typography.lineHeight.normal}px;`;
export const MyRank = styled(View)`padding: ${({ theme }) => theme.spacing.lg}px; border-radius: ${({ theme }) => theme.radius.xl}px; background-color: ${({ theme }) => theme.colors.primaryMuted}; border-width: 1px; border-color: ${({ theme }) => theme.colors.primaryBorder}; gap: ${({ theme }) => theme.spacing.xs}px;`;
export const RankNumber = styled(Text)`color: ${({ theme }) => theme.colors.primary}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: 52px; line-height: 56px;`;
export const RankLabel = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.md}px;`;
export const Row = styled(View)`flex-direction: row; justify-content: space-between; align-items: center; gap: ${({ theme }) => theme.spacing.md}px;`;
export const Tabs = styled(View)`flex-direction: row; gap: ${({ theme }) => theme.spacing.xs}px;`;
export const Tab = styled(Pressable)<{ $active: boolean }>`min-height: 44px; padding: 0 ${({ theme }) => theme.spacing.md}px; justify-content: center; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme, $active }) => $active ? theme.colors.primaryMuted : theme.colors.surface}; border-width: 1px; border-color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.border};`;
export const TabText = styled(Text)<{ $active: boolean }>`color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;

