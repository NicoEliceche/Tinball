import { FlatList, View } from 'react-native';
import styled from 'styled-components/native';
import type { Match } from '../../../core/types/match.types';
export const Screen = styled(View)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
export const List = styled(FlatList<Match>).attrs(({ theme }) => ({ style: { flex: 1 }, contentContainerStyle: { flexGrow: 1, padding: theme.spacing.md, paddingBottom: theme.spacing.hero, gap: theme.spacing.sm }, contentInsetAdjustmentBehavior: 'automatic' as const, showsVerticalScrollIndicator: false }))``;
export const Header = styled(View)`gap: ${({ theme }) => theme.spacing.sm}px; margin-bottom: ${({ theme }) => theme.spacing.sm}px;`;
