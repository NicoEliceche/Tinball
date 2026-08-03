import { Text, TextInput, View } from 'react-native';
import styled from 'styled-components/native';

export const ScoreRow = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const TeamColumn = styled(View)`
  flex: 1;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const TeamName = styled(Text)`
  min-height: 42px;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family.semibold};
  font-size: ${({ theme }) => theme.typography.size.md}px;
  text-align: center;
`;

export const Versus = styled(Text)`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.typography.family.display};
  font-size: 34px;
`;

export const ScoreField = styled(TextInput).attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.textMuted,
  selectTextOnFocus: true,
  textAlign: 'center' as const,
}))`
  width: 88px;
  min-height: 76px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.primaryBorder};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.family.display};
  font-size: 42px;
`;

export const ErrorCopy = styled(Text)`
  color: ${({ theme }) => theme.colors.danger};
  font-family: ${({ theme }) => theme.typography.family.semibold};
  font-size: ${({ theme }) => theme.typography.size.sm}px;
`;
