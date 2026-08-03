import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from 'styled-components/native';
import type { Lobby } from '../../../core/types/lobby.types';
import { StatusPill } from '../../../shared/components/StatusPill';
import { formatLabels, formatMatchDate, formatMoney } from '../../../shared/utils/format';
import { Card, Count, Meta, ProgressFill, ProgressTrack, Row, Title, Top } from './LobbyCardStyled';

export function LobbyCard({ lobby, onPress }: { lobby: Lobby; onPress: () => void }) {
  const theme = useTheme();
  const progress = lobby.joinedPlayers / lobby.requiredPlayers * 100;
  return (
    <Card accessibilityRole="button" accessibilityLabel={`${lobby.title}, ${lobby.joinedPlayers} de ${lobby.requiredPlayers} jugadores`} onPress={onPress}>
      <Top><Title>{lobby.title}</Title>{lobby.premiumOnly ? <StatusPill label="Premium" tone="warning" icon="diamond-outline" /> : <StatusPill label={lobby.mode === 'NEED_ONE' ? 'Me falta uno' : lobby.mode === 'PREMADE' ? 'Premade' : 'Abierto'} tone="primary" />}</Top>
      <Row><Ionicons name="calendar-outline" size={16} color={theme.colors.textMuted} /><Meta>{formatMatchDate(lobby.startsAt)}</Meta></Row>
      <Row><Ionicons name="location-outline" size={16} color={theme.colors.textMuted} /><Meta>{lobby.venueName} · {lobby.locality}</Meta></Row>
      <Row><StatusPill label={formatLabels[lobby.format]} /><StatusPill label={`${lobby.commitmentScore}% confiable`} tone="info" /></Row>
      <ProgressTrack><ProgressFill $progress={progress} /></ProgressTrack>
      <Top><Count>{lobby.joinedPlayers}/{lobby.requiredPlayers} jugadores</Count><Count>{formatMoney(lobby.pricePerPlayerMinor, lobby.currency)} c/u</Count></Top>
    </Card>
  );
}

