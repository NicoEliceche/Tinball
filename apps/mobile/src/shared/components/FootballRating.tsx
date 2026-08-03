import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

const RatingRow = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs}px;
`;

const RatingText = styled(Text)`
  margin-left: ${({ theme }) => theme.spacing.xxs}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.family.semibold};
  font-size: ${({ theme }) => theme.typography.size.sm}px;
`;

const BallButton = styled(Pressable)`
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
`;

interface FootballRatingProps {
  value: number;
  count?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}

export function FootballRating({ value, count, size = 19, interactive = false, onChange }: FootballRatingProps) {
  const theme = useTheme();
  const rounded = Math.round(value);
  return (
    <RatingRow accessibilityRole={interactive ? undefined : 'text'} accessibilityLabel={`${value.toFixed(1)} de 5 balones${count ? `, ${count} valoraciones` : ''}`}>
      {[1, 2, 3, 4, 5].map((ball) => interactive ? (
        <BallButton
          key={ball}
          accessibilityRole="button"
          accessibilityLabel={`${ball} ${ball === 1 ? 'balón' : 'balones'}`}
          onPress={() => onChange?.(ball)}
        >
          <Ionicons name={ball <= rounded ? 'football' : 'football-outline'} size={28} color={ball <= rounded ? theme.colors.primary : theme.colors.textMuted} />
        </BallButton>
      ) : (
        <Ionicons key={ball} name={ball <= rounded ? 'football' : 'football-outline'} size={size} color={ball <= rounded ? theme.colors.primary : theme.colors.textMuted} />
      ))}
      {count !== undefined && !interactive ? <RatingText>{value.toFixed(1)} ({count})</RatingText> : null}
    </RatingRow>
  );
}

