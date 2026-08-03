import { Text, View } from 'react-native';
import styled from 'styled-components/native';
export const Progress = styled(View)`height: 10px; overflow: hidden; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.surfaceElevated};`;
export const ProgressValue = styled(View)<{ $value: number }>`height: 10px; width: ${({ $value }) => Math.min(100, $value)}%; background-color: ${({ theme }) => theme.colors.primary};`;
export const PlayerStack = styled(View)`flex-direction: row; align-items: center; min-height: 52px;`;
export const Price = styled(Text)`color: ${({ theme }) => theme.colors.primary}; font-family: ${({ theme }) => theme.typography.family.displayExtra}; font-size: ${({ theme }) => theme.typography.size.xxl}px;`;

