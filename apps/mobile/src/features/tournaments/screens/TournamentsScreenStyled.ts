import { FlatList, Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';
import type { TournamentSummary } from '../types/tournament.types';
export const Screen = styled(View)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
export const List = styled(FlatList<TournamentSummary>).attrs(({ theme }) => ({ contentContainerStyle: { padding: theme.spacing.md, paddingBottom: theme.spacing.hero, gap: theme.spacing.sm }, contentInsetAdjustmentBehavior: 'automatic' as const, showsVerticalScrollIndicator: false }))``;
export const Header = styled(View)`gap: ${({ theme }) => theme.spacing.sm}px; margin-bottom: ${({ theme }) => theme.spacing.sm}px;`;
export const Card = styled(Pressable)`padding: ${({ theme }) => theme.spacing.lg}px; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radius.xl}px; background-color: ${({ theme }) => theme.colors.surface}; gap: ${({ theme }) => theme.spacing.sm}px;`;
export const Name = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: ${({ theme }) => theme.typography.size.xxl}px;`;
export const Prize = styled(Text)`color: ${({ theme }) => theme.colors.warning}; font-family: ${({ theme }) => theme.typography.family.display}; font-size: ${({ theme }) => theme.typography.size.xl}px;`;
export const Meta = styled(Text)`color: ${({ theme }) => theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;
export const Progress = styled(View)`height: 8px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.surfaceElevated}; overflow: hidden;`;
export const Fill = styled(View)<{ $value: number }>`height: 8px; width: ${({ $value }) => $value}%; background-color: ${({ theme }) => theme.colors.primary};`;

