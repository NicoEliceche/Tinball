import { Text, TextInput } from 'react-native';
import styled from 'styled-components/native';

export const ReasonField = styled(TextInput).attrs(({ theme }) => ({ multiline: true, placeholderTextColor: theme.colors.textMuted, textAlignVertical: 'top' as const }))`
  min-height: 108px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family.body};
  font-size: ${({ theme }) => theme.typography.size.md}px;
`;

export const ErrorCopy = styled(Text)`
  color: ${({ theme }) => theme.colors.danger};
  font-family: ${({ theme }) => theme.typography.family.semibold};
  font-size: ${({ theme }) => theme.typography.size.sm}px;
`;
