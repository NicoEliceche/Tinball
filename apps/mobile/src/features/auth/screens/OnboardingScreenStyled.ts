import { Pressable, Text, TextInput, View } from 'react-native';
import styled from 'styled-components/native';

export const Intro = styled(View)`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;
export const Step = styled(Text)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.family.bold};
  font-size: ${({ theme }) => theme.typography.size.xs}px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
`;
export const Title = styled(Text)`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family.displayExtra};
  font-size: ${({ theme }) => theme.typography.size.xxl}px;
`;
export const Copy = styled(Text)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.family.body};
  font-size: ${({ theme }) => theme.typography.size.md}px;
  line-height: ${({ theme }) => theme.typography.size.md * theme.typography.lineHeight.normal}px;
`;
export const FormSection = styled(View)`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;
export const Label = styled(Text)`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family.semibold};
  font-size: ${({ theme }) => theme.typography.size.sm}px;
`;
export const RequiredMark = styled(Text)`
  color: ${({ theme }) => theme.colors.danger};
  font-family: ${({ theme }) => theme.typography.family.semibold};
`;
export const Helper = styled(Text)`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.typography.family.body};
  font-size: ${({ theme }) => theme.typography.size.xs}px;
`;
export const Field = styled(TextInput).attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.textMuted,
}))`
  min-height: ${({ theme }) => theme.layout.touchTarget}px;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family.body};
  font-size: ${({ theme }) => theme.typography.size.md}px;
`;
export const BioField = styled(Field)`
  min-height: 104px;
  padding-top: ${({ theme }) => theme.spacing.md}px;
  padding-bottom: ${({ theme }) => theme.spacing.md}px;
`;
export const Chips = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;
export const Chip = styled(Pressable)<{ $selected: boolean }>`
  min-height: 44px;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme, $selected }) => $selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.full}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $selected }) => $selected ? theme.colors.primaryMuted : theme.colors.surface};
`;
export const ChipText = styled(Text)<{ $selected: boolean }>`
  color: ${({ theme, $selected }) => $selected ? theme.colors.primary : theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.family.semibold};
  font-size: ${({ theme }) => theme.typography.size.sm}px;
`;
export const ErrorText = styled(Text)`
  color: ${({ theme }) => theme.colors.danger};
  font-family: ${({ theme }) => theme.typography.family.medium};
  font-size: ${({ theme }) => theme.typography.size.sm}px;
`;
