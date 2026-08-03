import type { MatchFormat, Position } from '@tinball/contracts';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { Team } from '../../../core/types/match.types';
import type { RootStackParamList } from '../../../navigation/types';
import { Avatar } from '../../../shared/components/Avatar';
import { BodyText, Card, CardTitle, Flexible, HeroCard, Metric, MetricLabel, Metrics, MetricValue, Row, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { StatusPill } from '../../../shared/components/StatusPill';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { formatLabels, positionLabels } from '../../../shared/utils/format';
import { Crest, CrestText, Member, MemberList } from './TeamDetailScreenStyled';

interface TeamResponse {
  id: string; name: string; locality: string; format: MatchFormat; crestColor: string | null; isVerified: boolean; rankPoints: number;
  stats: { wins: number; draws: number; losses: number };
  canManage: boolean;
  members: { status: string; user: { id: string; displayName: string; avatarUrl: string | null; profile: { primaryPosition: Position } | null } }[];
}

export function TeamDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'TeamDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDemo } = useAuth();
  const team = useTinballStore((state) => state.teams.find((item) => item.id === route.params.teamId));
  const matches = useTinballStore((state) => state.matches);
  const updateTeam = useTinballStore((state) => state.updateTeam);
  const teamId = team?.id;

  useEffect(() => {
    if (isDemo || !teamId) return;
    let active = true;
    apiRequest<TeamResponse>(`/api/v1/teams/${teamId}`)
      .then((response) => {
        if (!active) return;
        const current = useTinballStore.getState().teams.find((item) => item.id === teamId);
        if (!current) return;
        const hydrated: Team = { ...current, name: response.name, locality: response.locality, format: response.format, crestColor: response.crestColor ?? current.crestColor, rankPoints: response.rankPoints, isVerified: response.isVerified, canManage: response.canManage, ...response.stats, memberCount: response.members.length, members: response.members.map((member) => ({ id: member.user.id, displayName: member.user.displayName, avatarUrl: member.user.avatarUrl ?? '', position: member.user.profile?.primaryPosition ?? 'MIDFIELDER', status: member.status === 'ACTIVE' ? 'CONFIRMED' : 'PENDING', isStarter: false })) };
        updateTeam(hydrated);
      })
      .catch((caught: unknown) => { if (active) Alert.alert('No pudimos actualizar el plantel', caught instanceof Error ? caught.message : 'Intentá nuevamente.'); });
    return () => { active = false; };
  }, [isDemo, teamId, updateTeam]);

  if (!team) return <ScrollScreen><ScreenTitle>Equipo no encontrado</ScreenTitle></ScrollScreen>;
  const upcoming = matches.find((match) => !['COMPLETED', 'CANCELLED'].includes(match.status) && (match.homeTeamId === team.id || match.awayTeamId === team.id || match.homeTeam === team.name || match.awayTeam === team.name));
  const initials = team.name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const hasChat = isDemo || !team.conversationId.startsWith('team-');

  return <ScrollScreen>
    <HeroCard><Row><Crest $color={team.crestColor}><CrestText>{initials}</CrestText></Crest><Flexible><ScreenTitle>{team.name}</ScreenTitle><BodyText>{team.locality} · {formatLabels[team.format]} · {team.memberCount} integrantes</BodyText><StatusPill label={team.isVerified ? 'Equipo verificado' : 'Equipo comunitario'} tone={team.isVerified ? 'primary' : 'neutral'} icon={team.isVerified ? 'shield-checkmark-outline' : 'people-outline'} /></Flexible></Row></HeroCard>
    <Metrics><Metric><MetricValue>{team.wins}</MetricValue><MetricLabel>Ganados</MetricLabel></Metric><Metric><MetricValue>{team.draws}</MetricValue><MetricLabel>Empates</MetricLabel></Metric><Metric><MetricValue>{team.losses}</MetricValue><MetricLabel>Perdidos</MetricLabel></Metric></Metrics>
    <PrimaryButton label={hasChat ? 'Chat del equipo' : 'Chat todavía no disponible'} icon="chatbubbles-outline" disabled={!hasChat} onPress={() => navigation.navigate('ChatRoom', { conversationId: team.conversationId, title: team.name })} />
    <Card><CardTitle>Plantel y formación</CardTitle><MemberList>{team.members.map((member) => <Member key={member.id}><Avatar uri={member.avatarUrl} name={member.displayName} size={42} /><Flexible><CardTitle>{member.displayName}</CardTitle><BodyText>{positionLabels[member.position]} · {member.isStarter ? 'Titular' : 'Suplente'}</BodyText></Flexible><StatusPill label={member.status === 'CONFIRMED' ? 'Disponible' : 'Pendiente'} tone={member.status === 'CONFIRMED' ? 'primary' : 'warning'} /></Member>)}</MemberList></Card>
    {team.canManage ? <Card><CardTitle>Administración</CardTitle><BodyText>El capitán puede convocar, mover titulares/suplentes y confirmar resultados. Cada cambio importante queda auditado.</BodyText><PrimaryButton label={upcoming ? 'Editar formación del próximo partido' : 'Sin partido próximo para editar'} icon="grid-outline" variant="secondary" disabled={!upcoming} onPress={() => { if (upcoming) navigation.navigate('EditLineup', { teamId: team.id, matchId: upcoming.id }); }} /><PrimaryButton label="Invitar jugadores" icon="person-add-outline" variant="secondary" onPress={() => navigation.navigate('Main', { screen: 'Discover', params: { teamId: team.id } })} /></Card> : <Card><CardTitle>Integrante del plantel</CardTitle><BodyText>Capitanes y administradores gestionan invitaciones y formaciones. Vos seguís teniendo acceso al vestuario y al chat.</BodyText></Card>}
  </ScrollScreen>;
}
