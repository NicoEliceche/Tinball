import { Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';
export const Row = styled(Pressable)<{ $mine: boolean }>`min-height: 68px; padding: ${({ theme }) => theme.spacing.sm}px; border-width: 1px; border-color: ${({ theme, $mine }) => $mine ? theme.colors.primaryBorder : theme.colors.border}; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme, $mine }) => $mine ? theme.colors.primaryMuted : theme.colors.surface}; flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px;`;
export const Position = styled(Text)`width: 28px; color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: ${({ theme }) => theme.typography.size.xl}px; text-align: center;`;
export const Copy = styled(View)`flex: 1;`;
export const Name = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.md}px;`;
export const Meta = styled(Text)`color: ${({ theme }) => theme.colors.textMuted}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.xs}px;`;
export const Points = styled(Text)`color: ${({ theme }) => theme.colors.primary}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: ${({ theme }) => theme.typography.size.lg}px;`;
export const Movement = styled(Text)<{ $up: boolean }>`color: ${({ theme, $up }) => $up ? theme.colors.success : theme.colors.danger}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.xs}px;`;

