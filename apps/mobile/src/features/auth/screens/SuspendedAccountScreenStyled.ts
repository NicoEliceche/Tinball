import { ScrollView, Text, TextInput, View } from 'react-native';
import styled from 'styled-components/native';

export const Screen = styled(ScrollView).attrs({ contentContainerStyle: { flexGrow: 1 } })`
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Content = styled(View)`
  flex: 1;
  width: 100%;
  max-width: 560px;
  align-self: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl}px ${({ theme }) => theme.spacing.md}px;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const Eyebrow = styled(Text)`
  color: ${({ theme }) => theme.colors.warning};
  font-family: ${({ theme }) => theme.typography.family.bold};
  font-size: ${({ theme }) => theme.typography.size.sm}px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const Title = styled(Text)`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family.displayExtra};
  font-size: ${({ theme }) => theme.typography.size.hero}px;
`;

export const Copy = styled(Text)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.family.body};
  font-size: ${({ theme }) => theme.typography.size.md}px;
  line-height: ${({ theme }) => theme.typography.size.md * theme.typography.lineHeight.relaxed}px;
`;

export const AppealInput = styled(TextInput).attrs(({ theme }) => ({ placeholderTextColor: theme.colors.textMuted, multiline: true, textAlignVertical: 'top' }))`
  min-height: 132px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family.body};
  font-size: ${({ theme }) => theme.typography.size.md}px;
`;

export const Message = styled(Text)<{ $error?: boolean }>`
  color: ${({ theme, $error }) => $error ? theme.colors.danger : theme.colors.success};
  font-family: ${({ theme }) => theme.typography.family.medium};
  font-size: ${({ theme }) => theme.typography.size.sm}px;
`;
