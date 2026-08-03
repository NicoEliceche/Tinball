import { Pressable, Text, TextInput, View } from 'react-native';
import styled from 'styled-components/native';

export const Group = styled(View)`gap: ${({ theme }) => theme.spacing.sm}px;`;
export const Label = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.semibold};`;
export const Field = styled(TextInput).attrs(({ theme }) => ({ placeholderTextColor: theme.colors.textMuted }))`min-height: ${({ theme }) => theme.layout.touchTarget}px; padding: 0 ${({ theme }) => theme.spacing.md}px; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surface}; color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.md}px;`;
export const Options = styled(View)`flex-direction: row; flex-wrap: wrap; gap: ${({ theme }) => theme.spacing.xs}px;`;
export const Option = styled(Pressable)<{ $selected: boolean }>`min-height: 44px; padding: 0 ${({ theme }) => theme.spacing.md}px; align-items: center; justify-content: center; border-width: 1px; border-color: ${({ theme, $selected }) => $selected ? theme.colors.primary : theme.colors.border}; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme, $selected }) => $selected ? theme.colors.primaryMuted : theme.colors.surface};`;
export const OptionText = styled(Text)<{ $selected: boolean }>`color: ${({ theme, $selected }) => $selected ? theme.colors.primary : theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.semibold};`;
export const Colors = styled(View)`flex-direction: row; gap: ${({ theme }) => theme.spacing.sm}px;`;
export const Color = styled(Pressable)<{ $color: string; $selected: boolean }>`width: 48px; height: 48px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ $color }) => $color}; border-width: ${({ $selected }) => $selected ? 4 : 1}px; border-color: ${({ theme, $selected }) => $selected ? theme.colors.text : theme.colors.border};`;
export const ErrorText = styled(Text)`color: ${({ theme }) => theme.colors.danger}; font-family: ${({ theme }) => theme.typography.family.medium};`;
