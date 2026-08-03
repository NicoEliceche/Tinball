import { Text, TextInput } from 'react-native';
import styled from 'styled-components/native';

export const CodeField = styled(TextInput).attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.textMuted,
  selectTextOnFocus: true,
  textAlign: 'center' as const,
}))`
  min-height: 82px;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.primaryBorder};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.family.displayExtra};
  font-size: 40px;
  letter-spacing: 10px;
`;

export const Code = styled(Text)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.family.displayExtra};
  font-size: 36px;
  letter-spacing: 7px;
  text-align: center;
`;

export const ErrorCopy = styled(Text)`
  color: ${({ theme }) => theme.colors.danger};
  font-family: ${({ theme }) => theme.typography.family.semibold};
  font-size: ${({ theme }) => theme.typography.size.sm}px;
`;
