import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
}

const Button = styled(Pressable)<{ $variant: ButtonVariant }>`
  min-height: ${({ theme }) => theme.layout.touchTarget}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  border-color: ${({ theme, $variant }) => $variant === 'secondary'
    ? theme.colors.primaryBorder
    : $variant === 'danger'
      ? theme.colors.danger
      : 'transparent'};
  background-color: ${({ theme, $variant }) => $variant === 'primary'
    ? theme.colors.primary
    : $variant === 'danger'
      ? theme.colors.dangerMuted
      : $variant === 'secondary'
        ? theme.colors.primaryMuted
        : 'transparent'};
  align-items: center;
  justify-content: center;
  opacity: ${({ disabled }) => disabled ? 0.45 : 1};
`;

const PressContent = styled(View)`
  min-height: ${({ theme }) => theme.layout.touchTarget}px;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const Label = styled(Text)<{ $variant: ButtonVariant }>`
  color: ${({ theme, $variant }) => $variant === 'primary'
    ? theme.colors.onPrimary
    : $variant === 'danger'
      ? theme.colors.danger
      : theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family.bold};
  font-size: ${({ theme }) => theme.typography.size.md}px;
`;

export function PrimaryButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  loading = false,
  disabled = false,
  accessibilityHint,
}: PrimaryButtonProps) {
  const theme = useTheme();
  const color = variant === 'primary' ? theme.colors.onPrimary : variant === 'danger' ? theme.colors.danger : theme.colors.text;
  return (
    <Button
      $variant={variant}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      disabled={disabled || loading}
      onPress={onPress}
    >
      {({ pressed }) => (
        <PressContent style={{ opacity: pressed ? 0.72 : 1 }}>
          {loading ? <ActivityIndicator color={color} /> : icon ? <Ionicons name={icon} size={20} color={color} /> : null}
          <Label $variant={variant}>{label}</Label>
        </PressContent>
      )}
    </Button>
  );
}

