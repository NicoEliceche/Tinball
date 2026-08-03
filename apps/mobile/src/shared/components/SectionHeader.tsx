import { Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';

const Row = styled(View)`
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const Copy = styled(View)`
  flex: 1;
  gap: ${({ theme }) => theme.spacing.xxs}px;
`;

const Title = styled(Text)`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family.display};
  font-size: ${({ theme }) => theme.typography.size.xl}px;
`;

const Subtitle = styled(Text)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.family.body};
  font-size: ${({ theme }) => theme.typography.size.sm}px;
`;

const Action = styled(Pressable)`
  min-height: 44px;
  justify-content: center;
`;

const ActionText = styled(Text)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.family.semibold};
  font-size: ${({ theme }) => theme.typography.size.sm}px;
`;

export function SectionHeader({ title, subtitle, actionLabel, onAction }: { title: string; subtitle?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <Row>
      <Copy>
        <Title>{title}</Title>
        {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
      </Copy>
      {actionLabel && onAction ? (
        <Action accessibilityRole="button" accessibilityLabel={actionLabel} onPress={onAction}>
          <ActionText>{actionLabel}</ActionText>
        </Action>
      ) : null}
    </Row>
  );
}

