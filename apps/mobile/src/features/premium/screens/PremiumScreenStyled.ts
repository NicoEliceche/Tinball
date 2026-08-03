import { Text, View } from 'react-native';
import styled from 'styled-components/native';
export const PremiumHero = styled(View)`padding: ${({ theme }) => theme.spacing.xl}px; border-radius: ${({ theme }) => theme.radius.xl}px; border-width: 1px; border-color: ${({ theme }) => theme.colors.warning}; background-color: ${({ theme }) => theme.colors.warningMuted}; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px;`;
export const Price = styled(Text)`color: ${({ theme }) => theme.colors.warning}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: 42px;`;
export const Center = styled(Text)`color: ${({ theme }) => theme.colors.textSecondary}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.md}px; text-align: center;`;
export const Benefits = styled(View)`gap: ${({ theme }) => theme.spacing.xs}px;`;

