import { Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';
export const Card = styled(View)`padding: ${({ theme }) => theme.spacing.md}px; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radius.lg}px; background-color: ${({ theme }) => theme.colors.surface}; gap: ${({ theme }) => theme.spacing.sm}px;`;
export const AuthorRow = styled(View)`flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px;`;
export const AuthorCopy = styled(View)`flex: 1;`;
export const Author = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.md}px;`;
export const Time = styled(Text)`color: ${({ theme }) => theme.colors.textMuted}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.xs}px;`;
export const Body = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.md}px; line-height: ${({ theme }) => theme.typography.size.md * theme.typography.lineHeight.normal}px;`;
export const ScoreBox = styled(View)`padding: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.backgroundAlt}; align-items: center; gap: ${({ theme }) => theme.spacing.xxs}px;`;
export const Score = styled(Text)`color: ${({ theme }) => theme.colors.primary}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: ${({ theme }) => theme.typography.size.xxl}px;`;
export const ScoreLabel = styled(Text)`color: ${({ theme }) => theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.medium}; font-size: ${({ theme }) => theme.typography.size.xs}px; text-align: center;`;
export const Actions = styled(View)`flex-direction: row; gap: ${({ theme }) => theme.spacing.lg}px;`;
export const Action = styled(Pressable)`min-height: 44px; flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.xs}px;`;
export const ActionText = styled(Text)<{ $active?: boolean }>`color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;

