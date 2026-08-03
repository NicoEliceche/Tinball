import { Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';
export const Card = styled(Pressable)`padding: ${({ theme }) => theme.spacing.md}px; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radius.lg}px; background-color: ${({ theme }) => theme.colors.surface}; gap: ${({ theme }) => theme.spacing.sm}px;`;
export const Top = styled(View)`flex-direction: row; justify-content: space-between; align-items: flex-start; gap: ${({ theme }) => theme.spacing.sm}px;`;
export const Title = styled(Text)`flex: 1; color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.display}; font-size: ${({ theme }) => theme.typography.size.xl}px;`;
export const Meta = styled(Text)`color: ${({ theme }) => theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;
export const Row = styled(View)`flex-direction: row; align-items: center; flex-wrap: wrap; gap: ${({ theme }) => theme.spacing.xs}px;`;
export const ProgressTrack = styled(View)`height: 7px; overflow: hidden; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.surfaceElevated};`;
export const ProgressFill = styled(View)<{ $progress: number }>`height: 7px; width: ${({ $progress }) => Math.min($progress, 100)}%; background-color: ${({ theme }) => theme.colors.primary};`;
export const Count = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.bold}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;

