import { FlatList, Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';
import type { Conversation } from '../../../core/types/social.types';
export const Screen = styled(View)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
export const List = styled(FlatList<Conversation>).attrs(({ theme }) => ({ contentContainerStyle: { padding: theme.spacing.md, paddingBottom: theme.spacing.hero, gap: theme.spacing.xs }, contentInsetAdjustmentBehavior: 'automatic' as const, showsVerticalScrollIndicator: false }))``;
export const Header = styled(View)`gap: ${({ theme }) => theme.spacing.xs}px; margin-bottom: ${({ theme }) => theme.spacing.sm}px;`;
export const ConversationRow = styled(Pressable)`min-height: 76px; padding: ${({ theme }) => theme.spacing.md}px; flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surface};`;
export const Copy = styled(View)`flex: 1; gap: ${({ theme }) => theme.spacing.xxs}px;`;
export const Title = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.md}px;`;
export const Subtitle = styled(Text)`color: ${({ theme }) => theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;
export const Badge = styled(View)`min-width: 24px; height: 24px; padding: 0 6px; border-radius: ${({ theme }) => theme.radius.full}px; align-items: center; justify-content: center; background-color: ${({ theme }) => theme.colors.primary};`;
export const BadgeText = styled(Text)`color: ${({ theme }) => theme.colors.onPrimary}; font-family: ${({ theme }) => theme.typography.family.bold}; font-size: ${({ theme }) => theme.typography.size.xs}px;`;

