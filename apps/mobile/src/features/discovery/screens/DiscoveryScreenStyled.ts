import { FlatList, Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';
import type { Lobby } from '../../../core/types/lobby.types';
export const Screen = styled(View)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
export const Content = styled(View)`flex: 1; width: 100%; max-width: ${({ theme }) => theme.layout.maxContentWidth}px; align-self: center; padding: ${({ theme }) => theme.spacing.md}px; gap: ${({ theme }) => theme.spacing.md}px;`;
export const Header = styled(View)`gap: ${({ theme }) => theme.spacing.xs}px;`;
export const Title = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: ${({ theme }) => theme.typography.size.xxl}px;`;
export const Copy = styled(Text)`color: ${({ theme }) => theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;
export const Segments = styled(View)`flex-direction: row; padding: ${({ theme }) => theme.spacing.xxs}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surface};`;
export const Segment = styled(Pressable)<{ $selected: boolean }>`flex: 1; min-height: 44px; border-radius: ${({ theme }) => theme.radius.sm}px; align-items: center; justify-content: center; background-color: ${({ theme, $selected }) => $selected ? theme.colors.primaryMuted : 'transparent'};`;
export const SegmentText = styled(Text)<{ $selected: boolean }>`color: ${({ theme, $selected }) => $selected ? theme.colors.primary : theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;
export const PlayerArea = styled(View)`flex: 1; gap: ${({ theme }) => theme.spacing.md}px;`;
export const Hint = styled(Text)`color: ${({ theme }) => theme.colors.textMuted}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.xs}px; text-align: center;`;
export const LobbyList = styled(FlatList<Lobby>).attrs(({ theme }) => ({ contentContainerStyle: { gap: theme.spacing.sm, paddingBottom: theme.spacing.hero }, showsVerticalScrollIndicator: false }))``;
export const FilterRow = styled(View)`flex-direction: row; gap: ${({ theme }) => theme.spacing.xs}px;`;
export const Filter = styled(Pressable)`min-height: 44px; padding: 0 ${({ theme }) => theme.spacing.md}px; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radius.full}px; flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.xs}px;`;
export const FilterText = styled(Text)`color: ${({ theme }) => theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;

