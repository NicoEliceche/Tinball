import { Text, View } from 'react-native';
import styled from 'styled-components/native';
export const Crest = styled(View)<{ $color: string }>`width: 76px; height: 76px; border-radius: ${({ theme }) => theme.radius.lg}px; background-color: ${({ $color }) => $color}; align-items: center; justify-content: center;`;
export const CrestText = styled(Text)`color: ${({ theme }) => theme.colors.onPrimary}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: ${({ theme }) => theme.typography.size.xxl}px;`;
export const MemberList = styled(View)`gap: ${({ theme }) => theme.spacing.xs}px;`;
export const Member = styled(View)`min-height: 58px; padding: ${({ theme }) => theme.spacing.xs}px; flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surfaceElevated};`;

