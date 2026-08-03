import { Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';
export const Card = styled(Pressable)`padding: ${({ theme }) => theme.spacing.md}px; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radius.lg}px; background-color: ${({ theme }) => theme.colors.surface}; gap: ${({ theme }) => theme.spacing.sm}px;`;
export const Header = styled(View)`flex-direction: row; justify-content: space-between; align-items: flex-start; gap: ${({ theme }) => theme.spacing.sm}px;`;
export const Label = styled(Text)`flex: 1; color: ${({ theme }) => theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;
export const Teams = styled(View)`flex-direction: row; align-items: center; justify-content: space-between; gap: ${({ theme }) => theme.spacing.sm}px;`;
export const Team = styled(Text)`flex: 1; color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.display}; font-size: ${({ theme }) => theme.typography.size.lg}px;`;
export const AwayTeam = styled(Team)`text-align: right;`;
export const Score = styled(Text)`color: ${({ theme }) => theme.colors.primary}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: ${({ theme }) => theme.typography.size.xxl}px;`;
export const Versus = styled(Text)`color: ${({ theme }) => theme.colors.textMuted}; font-family: ${({ theme }) => theme.typography.family.display}; font-size: ${({ theme }) => theme.typography.size.lg}px;`;
export const Meta = styled(Text)`color: ${({ theme }) => theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;

