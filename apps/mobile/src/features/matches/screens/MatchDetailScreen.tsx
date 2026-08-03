import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useTheme } from 'styled-components/native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { RootStackParamList } from '../../../navigation/types';
import { Avatar } from '../../../shared/components/Avatar';
import { BodyText, Card, CardTitle, MetaText, Row, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { SectionHeader } from '../../../shared/components/SectionHeader';
import { StatusPill } from '../../../shared/components/StatusPill';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { formatLabels, formatMatchDate, positionLabels } from '../../../shared/utils/format';
import { Away, Player, PlayerCopy, PlayerMeta, PlayerName, Players, Score, ScoreBoard, Team, Teams } from './MatchDetailScreenStyled';

export function MatchDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'MatchDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const { auth, isDemo } = useAuth();
  const match = useTinballStore((state) => state.matches.find((item) => item.id === route.params.matchId));
  const confirmLocal = useTinballStore((state) => state.confirmMatchParticipation);
  const [confirming, setConfirming] = useState(false);
  if (!match) return <ScrollScreen><ScreenTitle>Partido no encontrado</ScreenTitle></ScrollScreen>;
  const played = match.homeScore !== undefined && match.awayScore !== undefined;
  const ownParticipation = match.players.find((player) => player.id === auth?.user.id);
  const reviewSubject = match.players.find((player) => player.id !== auth?.user.id && player.status === 'CONFIRMED' && player.checkedIn);
  const hasChat = isDemo || !match.conversationId.startsWith('match-');

  const confirmAttendance = async () => {
    if (!auth?.user.id) return;
    setConfirming(true);
    try {
      if (!isDemo) await apiRequest(`/api/v1/matches/${match.id}/confirm`, { method: 'POST' });
      confirmLocal(match.id, auth.user.id);
      Alert.alert('Asistencia confirmada', 'Te recordaremos antes del partido y luego podrás hacer el check-in.');
    } catch (caught) {
      Alert.alert('No pudimos confirmar', caught instanceof Error ? caught.message : 'Intentá nuevamente.');
    } finally {
      setConfirming(false);
    }
  };

  return <ScrollScreen>
    <ScoreBoard><Row><StatusPill label={match.status === 'COMPLETED' ? 'Finalizado' : match.status === 'DISPUTED' ? 'En disputa' : 'Confirmado'} tone={match.status === 'COMPLETED' ? 'neutral' : match.status === 'DISPUTED' ? 'danger' : 'primary'} /><MetaText>{formatLabels[match.format]}</MetaText></Row><Teams><Team>{match.homeTeam}</Team><Score>{played ? `${match.homeScore} — ${match.awayScore}` : 'VS'}</Score><Away>{match.awayTeam}</Away></Teams><BodyText>{match.title}</BodyText></ScoreBoard>
    <Card><CardTitle>Cuándo y dónde</CardTitle><Row><Ionicons name="calendar-outline" size={20} color={theme.colors.primary} /><BodyText>{formatMatchDate(match.startsAt)}</BodyText></Row><Row><Ionicons name="location-outline" size={20} color={theme.colors.primary} /><BodyText>{match.venueName}, {match.locality}</BodyText></Row></Card>
    <SectionHeader title="Formación" subtitle="Titulares y suplentes confirmados" />
    <Card><Players>{match.players.map((player) => <Player key={player.id} accessibilityRole="button" onPress={() => navigation.navigate('PlayerProfile', { playerId: player.id })}><Avatar uri={player.avatarUrl} name={player.displayName} size={42} /><PlayerCopy><PlayerName>{player.displayName}</PlayerName><PlayerMeta>{positionLabels[player.position]} · {player.isStarter ? 'Titular' : 'Suplente'}</PlayerMeta></PlayerCopy><StatusPill label={player.status === 'CONFIRMED' ? player.checkedIn ? 'Presente' : 'Confirmado' : player.status === 'DECLINED' ? 'No participa' : player.status === 'NO_SHOW' ? 'Ausente' : 'Pendiente'} tone={player.status === 'CONFIRMED' ? 'primary' : player.status === 'NO_SHOW' ? 'danger' : 'warning'} /></Player>)}</Players></Card>
    {match.status === 'COMPLETED' && reviewSubject ? <PrimaryButton label="Valorar compañero" icon="football-outline" onPress={() => navigation.navigate('ReviewPlayer', { playerId: reviewSubject.id, matchId: match.id })} /> : ownParticipation?.status === 'PENDING' ? <PrimaryButton label="Confirmar asistencia" icon="checkmark-circle-outline" loading={confirming} disabled={confirming} onPress={() => { void confirmAttendance(); }} /> : null}
    {ownParticipation?.status === 'CONFIRMED' && ['CALLING', 'CONFIRMED', 'LIVE'].includes(match.status) ? ownParticipation.checkedIn ? <Card><Row><Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.primary} /><BodyText>Check-in verificado</BodyText></Row></Card> : <PrimaryButton label="Hacer check-in" icon="qr-code-outline" onPress={() => navigation.navigate('MatchCheckIn', { matchId: match.id })} /> : null}
    {(match.status === 'LIVE' || match.status === 'COMPLETED') && match.resultStatus !== 'CONFIRMED' && match.resultStatus !== 'DISPUTED' ? <PrimaryButton label={match.homeScore !== undefined ? 'Confirmar resultado' : 'Cargar resultado'} icon="football-outline" variant="secondary" onPress={() => navigation.navigate('SubmitResult', { matchId: match.id })} /> : null}
    {match.status === 'COMPLETED' && match.canManage ? <PrimaryButton label="Gestionar ausencias" icon="person-remove-outline" variant="secondary" onPress={() => navigation.navigate('ManageNoShows', { matchId: match.id })} /> : null}
    <PrimaryButton label={hasChat ? 'Chat del partido' : 'Chat todavía no disponible'} icon="chatbubbles-outline" variant="secondary" disabled={!hasChat} onPress={() => navigation.navigate('ChatRoom', { conversationId: match.conversationId, title: match.title })} />
    <PrimaryButton label="Reportar problema" icon="warning-outline" variant="ghost" onPress={() => navigation.navigate('Report', { targetType: 'MATCH', targetId: match.id })} />
  </ScrollScreen>;
}
