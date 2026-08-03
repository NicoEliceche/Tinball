import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

type Tone = 'primary' | 'info' | 'warning' | 'danger' | 'neutral';

const Pill = styled(View)<{ $tone: Tone }>`
  min-height: 28px;
  padding: 4px ${({ theme }) => theme.spacing.xs}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  gap: ${({ theme }) => theme.spacing.xxs}px;
  background-color: ${({ theme, $tone }) => $tone === 'primary'
    ? theme.colors.primaryMuted
    : $tone === 'info'
      ? theme.colors.infoMuted
      : $tone === 'warning'
        ? theme.colors.warningMuted
        : $tone === 'danger'
          ? theme.colors.dangerMuted
          : theme.colors.surfaceElevated};
`;

const PillText = styled(Text)<{ $tone: Tone }>`
  color: ${({ theme, $tone }) => $tone === 'primary'
    ? theme.colors.primary
    : $tone === 'info'
      ? theme.colors.info
      : $tone === 'warning'
        ? theme.colors.warning
        : $tone === 'danger'
          ? theme.colors.danger
          : theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.family.semibold};
  font-size: ${({ theme }) => theme.typography.size.xs}px;
`;

export function StatusPill({ label, tone = 'neutral', icon }: { label: string; tone?: Tone; icon?: keyof typeof Ionicons.glyphMap }) {
  const theme = useTheme();
  const color = tone === 'primary' ? theme.colors.primary : tone === 'info' ? theme.colors.info : tone === 'warning' ? theme.colors.warning : tone === 'danger' ? theme.colors.danger : theme.colors.textSecondary;
  return (
    <Pill $tone={tone} accessibilityLabel={label}>
      {icon ? <Ionicons name={icon} size={14} color={color} /> : null}
      <PillText $tone={tone}>{label}</PillText>
    </Pill>
  );
}

