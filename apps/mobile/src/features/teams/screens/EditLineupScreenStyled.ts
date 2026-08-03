import { Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';

export const Counter = styled(View)`padding: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.lg}px; background-color: ${({ theme }) => theme.colors.primaryMuted}; border-width: 1px; border-color: ${({ theme }) => theme.colors.primaryBorder};`;
export const CounterValue = styled(Text)`color: ${({ theme }) => theme.colors.primary}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: ${({ theme }) => theme.typography.size.xl}px;`;
export const PlayerRow = styled(Pressable)<{ $starter: boolean }>`min-height: 68px; padding: ${({ theme }) => theme.spacing.sm}px; flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px; border-width: 1px; border-color: ${({ theme, $starter }) => $starter ? theme.colors.primary : theme.colors.border}; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme, $starter }) => $starter ? theme.colors.primaryMuted : theme.colors.surface};`;
export const PlayerCopy = styled(View)`flex: 1;`;
export const PlayerName = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.md}px;`;
export const PlayerMeta = styled(Text)`color: ${({ theme }) => theme.colors.textMuted}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;
export const ErrorText = styled(Text)`color: ${({ theme }) => theme.colors.danger}; font-family: ${({ theme }) => theme.typography.family.medium};`;
