import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Text, View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { PrimaryButton } from './PrimaryButton';

const StateContainer = styled(View)`
  flex: 1;
  min-height: 260px;
  padding: ${({ theme }) => theme.spacing.xl}px;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const StateTitle = styled(Text)`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family.display};
  font-size: ${({ theme }) => theme.typography.size.xl}px;
  text-align: center;
`;

const StateMessage = styled(Text)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.family.body};
  font-size: ${({ theme }) => theme.typography.size.md}px;
  line-height: ${({ theme }) => theme.typography.size.md * theme.typography.lineHeight.normal}px;
  text-align: center;
`;

export function LoadingScreen({ message = 'Preparando la cancha…' }: { message?: string }) {
  const theme = useTheme();
  return (
    <StateContainer accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <StateMessage>{message}</StateMessage>
    </StateContainer>
  );
}

export function EmptyState({ title, message, icon = 'football-outline' }: { title: string; message: string; icon?: keyof typeof Ionicons.glyphMap }) {
  const theme = useTheme();
  return (
    <StateContainer>
      <Ionicons name={icon} size={42} color={theme.colors.textMuted} />
      <StateTitle>{title}</StateTitle>
      <StateMessage>{message}</StateMessage>
    </StateContainer>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const theme = useTheme();
  return (
    <StateContainer accessibilityLiveRegion="polite">
      <Ionicons name="cloud-offline-outline" size={42} color={theme.colors.danger} />
      <StateTitle>No pudimos cargar la cancha</StateTitle>
      <StateMessage>{message}</StateMessage>
      <PrimaryButton label="Reintentar" icon="refresh-outline" onPress={onRetry} />
    </StateContainer>
  );
}
