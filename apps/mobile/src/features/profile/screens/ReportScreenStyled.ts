import { Pressable, Text, TextInput, View } from 'react-native';
import styled from 'styled-components/native';

export const Options = styled(View)`flex-direction: row; flex-wrap: wrap; gap: ${({ theme }) => theme.spacing.xs}px;`;
export const Option = styled(Pressable)<{ $selected: boolean }>`min-height: 44px; padding: 0 ${({ theme }) => theme.spacing.md}px; justify-content: center; border-width: 1px; border-color: ${({ theme, $selected }) => $selected ? theme.colors.danger : theme.colors.border}; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.surface};`;
export const OptionText = styled(Text)<{ $selected: boolean }>`color: ${({ theme, $selected }) => $selected ? theme.colors.danger : theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.semibold};`;
export const Detail = styled(TextInput).attrs(({ theme }) => ({ placeholderTextColor: theme.colors.textMuted, multiline: true }))`min-height: 180px; padding: ${({ theme }) => theme.spacing.md}px; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radius.lg}px; background-color: ${({ theme }) => theme.colors.surface}; color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.md}px;`;
export const ErrorText = styled(Text)`color: ${({ theme }) => theme.colors.danger}; font-family: ${({ theme }) => theme.typography.family.medium};`;
