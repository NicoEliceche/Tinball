import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';

export const Card = styled(View)`
  overflow: hidden;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;
export const Photo = styled(Image)`
  width: 100%;
  aspect-ratio: 1.18;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
`;
export const Content = styled(View)`
  padding: ${({ theme }) => theme.spacing.md}px;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;
export const Header = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;
export const Name = styled(Text)`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family.displayExtra};
  font-size: ${({ theme }) => theme.typography.size.xxl}px;
`;
export const Meta = styled(Text)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.family.medium};
  font-size: ${({ theme }) => theme.typography.size.sm}px;
`;
export const Bio = styled(Text)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.family.body};
  font-size: ${({ theme }) => theme.typography.size.md}px;
  line-height: ${({ theme }) => theme.typography.size.md * theme.typography.lineHeight.normal}px;
`;
export const TagRow = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;
export const Tag = styled(View)`
  padding: 5px ${({ theme }) => theme.spacing.xs}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
`;
export const TagText = styled(Text)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.family.medium};
  font-size: ${({ theme }) => theme.typography.size.xs}px;
`;
export const Actions = styled(View)`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;
export const Action = styled(Pressable)<{ $accept: boolean }>`
  flex: 1;
  min-height: 52px;
  border-width: 1px;
  border-color: ${({ theme, $accept }) => $accept ? theme.colors.primary : theme.colors.danger};
  border-radius: ${({ theme }) => theme.radius.md}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  background-color: ${({ theme, $accept }) => $accept ? theme.colors.primaryMuted : theme.colors.dangerMuted};
`;
export const ActionText = styled(Text)<{ $accept: boolean }>`
  color: ${({ theme, $accept }) => $accept ? theme.colors.primary : theme.colors.danger};
  font-family: ${({ theme }) => theme.typography.family.bold};
  font-size: ${({ theme }) => theme.typography.size.sm}px;
`;

