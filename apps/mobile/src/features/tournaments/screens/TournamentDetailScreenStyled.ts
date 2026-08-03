import { Text, View } from 'react-native';
import styled from 'styled-components/native';
export const Bracket = styled(View)`gap: ${({ theme }) => theme.spacing.xs}px;`;
export const Fixture = styled(View)`padding: ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surfaceElevated}; gap: ${({ theme }) => theme.spacing.xxs}px;`;
export const FixtureText = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-family: ${({ theme }) => theme.typography.family.semibold}; font-size: ${({ theme }) => theme.typography.size.sm}px;`;
export const FixtureMeta = styled(Text)`color: ${({ theme }) => theme.colors.textMuted}; font-family: ${({ theme }) => theme.typography.family.body}; font-size: ${({ theme }) => theme.typography.size.xs}px;`;

