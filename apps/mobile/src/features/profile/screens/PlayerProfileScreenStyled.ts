import { Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';
export const Header = styled(View)`align-items: center; gap: ${({ theme }) => theme.spacing.sm}px;`;
export const Name = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: ${({ theme }) => theme.typography.size.xxl}px; text-align: center;`;
export const Bio = styled(Text)`color: ${({ theme }) => theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.md}px; line-height: ${({ theme }) => theme.typography.size.md * theme.typography.lineHeight.normal}px; text-align: center;`;
export const Tags = styled(View)`flex-direction: row; flex-wrap: wrap; justify-content: center; gap: ${({ theme }) => theme.spacing.xs}px;`;
export const Link = styled(Pressable)`min-height: 44px; justify-content: center;`;
export const LinkText = styled(Text)`color: ${({ theme }) => theme.colors.primary}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;

