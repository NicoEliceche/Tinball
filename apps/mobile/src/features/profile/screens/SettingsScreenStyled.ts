import { Text, View } from 'react-native';
import styled from 'styled-components/native';
export const SettingRow = styled(View)`min-height: 64px; flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.sm}px 0; border-bottom-width: 1px; border-bottom-color: ${({ theme }) => theme.colors.border};`;
export const Copy = styled(View)`flex: 1; gap: ${({ theme }) => theme.spacing.xxs}px;`;
export const Label = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.medium}; font-size: ${({ theme }) => theme.typography.size.md}px;`;
export const Helper = styled(Text)`color: ${({ theme }) => theme.colors.textMuted}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.xs}px;`;

