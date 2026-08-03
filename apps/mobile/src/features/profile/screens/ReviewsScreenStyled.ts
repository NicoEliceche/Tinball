import { FlatList, Text, View } from 'react-native';
import styled from 'styled-components/native';
import type { PlayerReview } from '../../../core/types/player.types';
export const Screen = styled(View)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
export const List = styled(FlatList<PlayerReview>).attrs(({ theme }) => ({ contentContainerStyle: { padding: theme.spacing.md, paddingBottom: theme.spacing.hero, gap: theme.spacing.sm }, contentInsetAdjustmentBehavior: 'automatic' as const, showsVerticalScrollIndicator: false }))``;
export const Header = styled(View)`gap: ${({ theme }) => theme.spacing.sm}px; margin-bottom: ${({ theme }) => theme.spacing.sm}px;`;
export const ReviewCard = styled(View)`padding: ${({ theme }) => theme.spacing.md}px; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radius.lg}px; background-color: ${({ theme }) => theme.colors.surface}; gap: ${({ theme }) => theme.spacing.xs}px;`;
export const Author = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.md}px;`;
export const Comment = styled(Text)`color: ${({ theme }) => theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.md}px; line-height: ${({ theme }) => theme.typography.size.md * theme.typography.lineHeight.normal}px;`;
export const Meta = styled(Text)`color: ${({ theme }) => theme.colors.textMuted}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.xs}px;`;

