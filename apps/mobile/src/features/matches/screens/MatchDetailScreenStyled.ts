import { Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';
export const ScoreBoard = styled(View)`padding: ${({ theme }) => theme.spacing.lg}px; border-radius: ${({ theme }) => theme.radius.xl}px; border-width: 1px; border-color: ${({ theme }) => theme.colors.primaryBorder}; background-color: ${({ theme }) => theme.colors.primaryMuted}; gap: ${({ theme }) => theme.spacing.sm}px;`;
export const Teams = styled(View)`flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px;`;
export const Team = styled(Text)`flex: 1; color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.display}; font-size: ${({ theme }) => theme.typography.size.xl}px;`;
export const Away = styled(Team)`text-align: right;`;
export const Score = styled(Text)`color: ${({ theme }) => theme.colors.primary}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: 44px;`;
export const Players = styled(View)`gap: ${({ theme }) => theme.spacing.xs}px;`;
export const Player = styled(Pressable)`min-height: 58px; padding: ${({ theme }) => theme.spacing.xs}px; flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surfaceElevated};`;
export const PlayerCopy = styled(View)`flex: 1;`;
export const PlayerName = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;
export const PlayerMeta = styled(Text)`color: ${({ theme }) => theme.colors.textMuted}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.xs}px;`;

