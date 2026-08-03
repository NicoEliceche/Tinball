import { FlatList, Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';
import type { Match } from '../../../core/types/match.types';
export const Screen = styled(View)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
export const List = styled(FlatList<Match>).attrs(({ theme }) => ({ contentContainerStyle: { padding: theme.spacing.md, paddingBottom: theme.spacing.hero, gap: theme.spacing.sm }, contentInsetAdjustmentBehavior: 'automatic' as const, showsVerticalScrollIndicator: false }))``;
export const Header = styled(View)`gap: ${({ theme }) => theme.spacing.lg}px; margin-bottom: ${({ theme }) => theme.spacing.sm}px;`;
export const Title = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: ${({ theme }) => theme.typography.size.xxl}px;`;
export const Copy = styled(Text)`color: ${({ theme }) => theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;
export const HeaderCopy = styled(View)`gap: ${({ theme }) => theme.spacing.xxs}px;`;
export const TeamCard = styled(Pressable)`padding: ${({ theme }) => theme.spacing.lg}px; border-radius: ${({ theme }) => theme.radius.xl}px; border-width: 1px; border-color: ${({ theme }) => theme.colors.primaryBorder}; background-color: ${({ theme }) => theme.colors.primaryMuted}; gap: ${({ theme }) => theme.spacing.sm}px;`;
export const TeamTitle = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: ${({ theme }) => theme.typography.size.xxl}px;`;
export const TeamMeta = styled(Text)`color: ${({ theme }) => theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.medium}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;
export const ActionRow = styled(View)`flex-direction: row; gap: ${({ theme }) => theme.spacing.sm}px;`;
export const Action = styled(Pressable)`flex: 1; min-height: 72px; padding: ${({ theme }) => theme.spacing.sm}px; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surface}; justify-content: space-between;`;
export const ActionText = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;
export const Segments = styled(View)`flex-direction: row; gap: ${({ theme }) => theme.spacing.xs}px;`;
export const Segment = styled(Pressable)<{ $selected: boolean }>`min-height: 44px; padding: 0 ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.full}px; border-width: 1px; border-color: ${({ theme, $selected }) => $selected ? theme.colors.primary : theme.colors.border}; justify-content: center; background-color: ${({ theme, $selected }) => $selected ? theme.colors.primaryMuted : theme.colors.surface};`;
export const SegmentText = styled(Text)<{ $selected: boolean }>`color: ${({ theme, $selected }) => $selected ? theme.colors.primary : theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;

