import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { randomUUID } from 'expo-crypto';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useTheme } from 'styled-components/native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { RootStackParamList } from '../../../navigation/types';
import { Avatar } from '../../../shared/components/Avatar';
import { BodyText, BetweenRow, Card, CardTitle, HeroCard, MetaText, Row, ScreenTitle, WrapRow } from '../../../shared/components/DetailPrimitives';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { StatusPill } from '../../../shared/components/StatusPill';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { formatLabels, formatMatchDate, formatMoney, positionLabels } from '../../../shared/utils/format';
import { PlayerStack, Price, Progress, ProgressValue } from './LobbyDetailScreenStyled';

interface LobbyRequest { userId: string; displayName: string; avatarUrl: string | null; position: keyof typeof positionLabels; rating: number; reliability: number }

export function LobbyDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'LobbyDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const { auth, isDemo } = useAuth();
  const lobby = useTinballStore((state) => state.lobbies.find((item) => item.id === route.params.lobbyId));
  const players = useTinballStore((state) => state.players);
  const profile = useTinballStore((state) => state.currentProfile);
  const joined = useTinballStore((state) => state.joinedLobbyIds.includes(route.params.lobbyId));
  const joinLobby = useTinballStore((state) => state.joinLobby);
  const clearData = useTinballStore((state) => state.clearData);
  const [joining, setJoining] = useState(false);
  const [requests, setRequests] = useState<LobbyRequest[]>([]);
  const isOrganizer = lobby?.organizerId === auth?.user.id;
  useEffect(() => {
    if (!lobby || !isOrganizer || isDemo) return;
    let active = true;
    apiRequest<{ items: LobbyRequest[] }>(`/api/v1/lobbies/${lobby.id}/requests`)
      .then((response) => { if (active) setRequests(response.items); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [isDemo, isOrganizer, lobby]);
  if (!lobby) return <ScrollScreen><ScreenTitle>Lobby no encontrado</ScreenTitle></ScrollScreen>;
  const available = lobby.requiredPlayers - lobby.joinedPlayers;
  const requiresPremium = lobby.premiumOnly && !auth?.user.isPremium;
  const confirmed = isDemo ? joined : lobby.myParticipationStatus === 'CONFIRMED';

  const join = async () => {
    setJoining(true);
    try {
      if (!isDemo) await apiRequest(`/api/v1/lobbies/${lobby.id}/join`, { method: 'POST', body: { position: profile?.primaryPosition ?? 'MIDFIELDER', idempotencyKey: randomUUID() } });
      joinLobby(lobby.id);
      Alert.alert('Solicitud enviada', 'El organizador podrá confirmar tu lugar. Después recibirás el acceso al chat.');
    } catch (caught) {
      Alert.alert('No pudimos reservar el cupo', caught instanceof Error ? caught.message : 'Intentá nuevamente.');
    } finally {
      setJoining(false);
    }
  };
  const respond = async (userId: string, decision: 'ACCEPTED' | 'DECLINED') => {
    try {
      if (!isDemo) await apiRequest(`/api/v1/lobbies/${lobby.id}/requests/${userId}/respond`, { method: 'POST', body: { decision } });
      setRequests((current) => current.filter((request) => request.userId !== userId));
    } catch (caught) {
      Alert.alert('No pudimos responder', caught instanceof Error ? caught.message : 'Intentá nuevamente.');
    }
  };
  const confirmMatch = async () => {
    try {
      if (!isDemo) await apiRequest(`/api/v1/lobbies/${lobby.id}/confirm`, { method: 'POST' });
      Alert.alert('Partido confirmado', 'Ya aparece en el calendario y el chat quedó habilitado para el plantel.');
      if (!isDemo) clearData();
    } catch (caught) {
      Alert.alert('No pudimos confirmar el partido', caught instanceof Error ? caught.message : 'Intentá nuevamente.');
    }
  };

  return <ScrollScreen>
    <HeroCard><BetweenRow><StatusPill label={lobby.mode === 'NEED_ONE' ? 'Me falta uno' : lobby.mode === 'PREMADE' ? 'Premade' : 'Lobby abierto'} tone="primary" /><StatusPill label={`${lobby.commitmentScore}% confiable`} tone="info" /></BetweenRow><ScreenTitle>{lobby.title}</ScreenTitle><BodyText>{lobby.notes}</BodyText></HeroCard>
    <Card><CardTitle>Datos del partido</CardTitle><Row><Ionicons name="calendar-outline" size={20} color={theme.colors.primary} /><BodyText>{formatMatchDate(lobby.startsAt)} · {lobby.durationMinutes} min</BodyText></Row><Row><Ionicons name="location-outline" size={20} color={theme.colors.primary} /><BodyText>{lobby.venueName}, {lobby.locality}</BodyText></Row><WrapRow><StatusPill label={formatLabels[lobby.format]} /><StatusPill label={`${lobby.skillMin.toLowerCase()} a ${lobby.skillMax.toLowerCase()}`} /></WrapRow><Price>{formatMoney(lobby.pricePerPlayerMinor, lobby.currency)} por jugador</Price></Card>
    <Card><BetweenRow><CardTitle>Cupos</CardTitle><MetaText>{lobby.joinedPlayers}/{lobby.requiredPlayers}</MetaText></BetweenRow><Progress><ProgressValue $value={lobby.joinedPlayers / lobby.requiredPlayers * 100} /></Progress><MetaText>{available > 0 ? `Faltan ${available} jugadores` : 'Equipo completo'}</MetaText><PlayerStack>{players.slice(0, 4).map((player) => <Avatar key={player.id} uri={player.avatarUrl} name={player.displayName} size={44} />)}</PlayerStack>{lobby.positionsNeeded.length > 0 ? <WrapRow>{lobby.positionsNeeded.map((position) => <StatusPill key={position} label={positionLabels[position]} tone="warning" />)}</WrapRow> : null}</Card>
    <Card><CardTitle>Organiza {lobby.organizerName}</CardTitle><MetaText>Reputación de asistencia visible · reglas y costo informados antes de sumarte</MetaText></Card>
    {isOrganizer ? <Card><CardTitle>Solicitudes pendientes</CardTitle>{requests.length > 0 ? requests.map((request) => <Card key={request.userId}><Row><Avatar uri={request.avatarUrl} name={request.displayName} size={42} /><BodyText>{request.displayName} · {request.position ? positionLabels[request.position] : 'Sin posición'} · {request.reliability}% confiable</BodyText></Row><PrimaryButton label="Aceptar" icon="checkmark-circle-outline" onPress={() => { void respond(request.userId, 'ACCEPTED'); }} /><PrimaryButton label="Rechazar" icon="close-circle-outline" variant="ghost" onPress={() => { void respond(request.userId, 'DECLINED'); }} /></Card>) : <MetaText>No hay solicitudes nuevas.</MetaText>}<PrimaryButton label="Invitar jugadores" icon="person-add-outline" variant="secondary" onPress={() => navigation.navigate('Main', { screen: 'Discover', params: { lobbyId: lobby.id } })} /></Card> : null}
    {isOrganizer && lobby.status === 'FULL' ? <PrimaryButton label="Confirmar y crear partido" icon="calendar-outline" onPress={() => { void confirmMatch(); }} /> : null}
    <PrimaryButton label={joined ? confirmed ? 'Lugar confirmado' : 'Solicitud pendiente' : requiresPremium ? 'Ver Premium' : 'Sumarme al partido'} icon={joined ? 'checkmark-circle' : requiresPremium ? 'diamond-outline' : 'enter-outline'} loading={joining} disabled={joined || joining || available <= 0} onPress={requiresPremium ? () => navigation.navigate('Premium') : join} />
    <PrimaryButton label={confirmed ? 'Abrir chat del lobby' : 'El chat se habilita al confirmar'} icon="chatbubbles-outline" variant="secondary" disabled={!confirmed} onPress={() => navigation.navigate('ChatRoom', { conversationId: lobby.conversationId ?? `chat-${lobby.id}`, title: lobby.title })} />
  </ScrollScreen>;
}
