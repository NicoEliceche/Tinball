import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import { useTheme } from 'styled-components/native';
import type { Match } from '../../../core/types/match.types';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { RootStackParamList } from '../../../navigation/types';
import { SectionHeader } from '../../../shared/components/SectionHeader';
import { MatchCard } from '../components/MatchCard';
import { Action, ActionRow, ActionText, Copy, Header, HeaderCopy, List, Screen, Segment, Segments, SegmentText, TeamCard, TeamMeta, TeamTitle, Title } from './MatchesScreenStyled';
export function MatchesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const [period, setPeriod] = useState<'upcoming' | 'history'>('upcoming');
  const matches = useTinballStore((state) => state.matches);
  const team = useTinballStore((state) => state.teams[0]);
  const filtered = useMemo(() => matches.filter((match) => period === 'history' ? match.status === 'COMPLETED' || match.status === 'CANCELLED' : match.status !== 'COMPLETED' && match.status !== 'CANCELLED'), [matches, period]);
  const renderItem = useCallback(({ item }: { item: Match }) => <MatchCard match={item} onPress={() => navigation.navigate('MatchDetail', { matchId: item.id })} />, [navigation]);
  const header = <Header><HeaderCopy><Title>Partidos</Title><Copy>Convocatorias, plantel e historial en un solo lugar.</Copy></HeaderCopy>{team ? <TeamCard accessibilityRole="button" accessibilityLabel="Ver mis equipos" onPress={() => navigation.navigate('Teams')}><TeamMeta>{team.memberCount} integrantes · Mis equipos</TeamMeta><TeamTitle>{team.name}</TeamTitle><TeamMeta>{team.wins} G · {team.draws} E · {team.losses} P · {team.rankPoints} puntos · Ver todos</TeamMeta></TeamCard> : <TeamCard accessibilityRole="button" accessibilityLabel="Crear mi primer equipo" onPress={() => navigation.navigate('CreateTeam')}><TeamMeta>Tu vestuario</TeamMeta><TeamTitle>Creá tu primer equipo</TeamTitle><TeamMeta>Sumá el plantel, definí roles y armá formaciones.</TeamMeta></TeamCard>}<ActionRow><Action accessibilityRole="button" onPress={() => navigation.navigate('Conversations')}><Ionicons name="chatbubbles-outline" size={23} color={theme.colors.primary} /><ActionText>Chats</ActionText></Action><Action accessibilityRole="button" onPress={() => navigation.navigate('Tournaments')}><Ionicons name="trophy-outline" size={23} color={theme.colors.warning} /><ActionText>Torneos</ActionText></Action><Action accessibilityRole="button" onPress={() => navigation.navigate('History')}><Ionicons name="time-outline" size={23} color={theme.colors.info} /><ActionText>Historial</ActionText></Action></ActionRow><SectionHeader title="Calendario" /><Segments><Segment $selected={period === 'upcoming'} onPress={() => setPeriod('upcoming')}><SegmentText $selected={period === 'upcoming'}>Próximos</SegmentText></Segment><Segment $selected={period === 'history'} onPress={() => setPeriod('history')}><SegmentText $selected={period === 'history'}>Finalizados</SegmentText></Segment></Segments></Header>;
  return <Screen><List data={filtered} keyExtractor={(item) => item.id} renderItem={renderItem} ListHeaderComponent={header} /></Screen>;
}
