import { FlatList, Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';
import type { Venue } from '../../../core/types/ranking.types';
export const Screen = styled(View)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
export const List = styled(FlatList<Venue>).attrs(({ theme }) => ({ contentContainerStyle: { padding: theme.spacing.md, paddingBottom: theme.spacing.hero, gap: theme.spacing.sm }, contentInsetAdjustmentBehavior: 'automatic' as const, showsVerticalScrollIndicator: false }))``;
export const Header = styled(View)`gap: ${({ theme }) => theme.spacing.sm}px; margin-bottom: ${({ theme }) => theme.spacing.sm}px;`;
export const Card = styled(Pressable)`padding: ${({ theme }) => theme.spacing.md}px; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radius.lg}px; background-color: ${({ theme }) => theme.colors.surface}; gap: ${({ theme }) => theme.spacing.xs}px;`;
export const Name = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.display}; font-size: ${({ theme }) => theme.typography.size.xl}px;`;
export const Meta = styled(Text)`color: ${({ theme }) => theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;
export const Price = styled(Text)`color: ${({ theme }) => theme.colors.primary}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.md}px;`;
export const Filters = styled(View)`flex-direction: row; gap: ${({ theme }) => theme.spacing.xs}px;`;
export const Filter = styled(Pressable)`min-height: 44px; padding: 0 ${({ theme }) => theme.spacing.md}px; justify-content: center; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.surface};`;
export const FilterText = styled(Text)`color: ${({ theme }) => theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;

