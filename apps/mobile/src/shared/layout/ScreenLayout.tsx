import type { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import styled from 'styled-components/native';

export const ScreenRoot = styled(View)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const ScreenScroll = styled(ScrollView).attrs({
  contentInsetAdjustmentBehavior: 'automatic' as const,
  keyboardShouldPersistTaps: 'handled' as const,
  showsVerticalScrollIndicator: false,
})``;

export const ScreenContent = styled(View)`
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxContentWidth}px;
  align-self: center;
  padding: ${({ theme }) => theme.spacing.md}px;
  padding-bottom: ${({ theme }) => theme.spacing.hero}px;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export function ScrollScreen({ children }: PropsWithChildren) {
  return (
    <ScreenRoot>
      <ScreenScroll>
        <ScreenContent>{children}</ScreenContent>
      </ScreenScroll>
    </ScreenRoot>
  );
}

