import { useRoute, type RouteProp } from '@react-navigation/native';
import { randomUUID } from 'expo-crypto';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { RootStackParamList } from '../../../navigation/types';
import { BodyText, Card, CardTitle, HeroCard, Metric, MetricLabel, Metrics, MetricValue, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { StatusPill } from '../../../shared/components/StatusPill';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { formatLabels, formatMatchDate, formatMoney } from '../../../shared/utils/format';
import { Bracket, Fixture, FixtureMeta, FixtureText } from './TournamentDetailScreenStyled';

interface TournamentDetail {
  id: string; name: string; status: string; format: keyof typeof formatLabels; locality: string; startsAt: string; maxTeams: number; rosterLimit: number;
  entryFeeMinor: number; prizePoolMinor: number; currency: string; rules: string;
  paidCompetitionsEnabled?: boolean;
  entries: { id: string; team: { id: string; name: string } }[];
  games: { id: string; round: string; scheduledAt: string | null; match: { homeTeam: { name: string } | null; awayTeam: { name: string } | null } | null }[];
}
const demoTournament: TournamentDetail = { id: 't-aug-biweekly', name: 'Copa Tinball Agosto', status: 'REGISTRATION_OPEN', format: 'SEVEN_A_SIDE', locality: 'CABA', startsAt: '2026-08-15T10:00:00-03:00', maxTeams: 32, rosterLimit: 12, entryFeeMinor: 5_000_000, prizePoolMinor: 100_000_000, currency: 'ARS', rules: 'Plantel de hasta 12 jugadores, identidad verificada, lista bloqueada al inicio y resultados confirmados por ambos capitanes.', entries: Array.from({ length: 24 }, (_, index) => ({ id: `entry-${index}`, team: { id: `team-${index}`, name: `Equipo ${index + 1}` } })), games: [] };

export function TournamentDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'TournamentDetail'>>();
  const { isDemo } = useAuth();
  const teams = useTinballStore((state) => state.teams);
  const [tournament, setTournament] = useState<TournamentDetail | null>(isDemo ? { ...demoTournament, id: route.params.tournamentId } : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (isDemo) return;
    let active = true;
    apiRequest<TournamentDetail>(`/api/v1/tournaments/${route.params.tournamentId}`)
      .then((response) => { if (active) setTournament(response); })
      .catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : 'No pudimos cargar el torneo.'); });
    return () => { active = false; };
  }, [isDemo, route.params.tournamentId]);
  if (!tournament) return <ScrollScreen><ScreenTitle>{error || 'Cargando torneo…'}</ScreenTitle></ScrollScreen>;
  const registrationOpen = tournament.status === 'REGISTRATION_OPEN';
  const requiresMoney = tournament.entryFeeMinor > 0 || tournament.prizePoolMinor > 0;
  const registrationEnabled = registrationOpen && (!requiresMoney || tournament.paidCompetitionsEnabled === true);
  const selectedTeam = teams.find((team) => team.format === tournament.format) ?? teams[0];

  const register = async () => {
    if (!selectedTeam) {
      Alert.alert('Necesitás un equipo', 'Creá o administrá un equipo del mismo formato antes de inscribirte.');
      return;
    }
    setLoading(true);
    try {
      if (!isDemo) await apiRequest(`/api/v1/tournaments/${tournament.id}/register`, { method: 'POST', body: { teamId: selectedTeam.id, idempotencyKey: randomUUID() } });
      Alert.alert('Preinscripción guardada', tournament.entryFeeMinor > 0 ? 'El lugar queda pendiente hasta que se habilite y confirme el circuito de pago regulado.' : 'El equipo quedó pendiente de validación de plantel.');
    } catch (caught) {
      Alert.alert('No pudimos inscribir al equipo', caught instanceof Error ? caught.message : 'Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return <ScrollScreen>
    <HeroCard><StatusPill label={registrationOpen ? 'Inscripción abierta' : 'Próximamente'} tone={registrationOpen ? 'primary' : 'neutral'} /><ScreenTitle>{tournament.name}</ScreenTitle><BodyText>{tournament.maxTeams} equipos · {formatLabels[tournament.format]} · {tournament.locality}</BodyText></HeroCard>
    <Metrics><Metric><MetricValue>{tournament.entries.length}/{tournament.maxTeams}</MetricValue><MetricLabel>Equipos</MetricLabel></Metric><Metric><MetricValue>{new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(new Date(tournament.startsAt)).toUpperCase()}</MetricValue><MetricLabel>Comienza</MetricLabel></Metric><Metric><MetricValue>{tournament.prizePoolMinor > 0 ? formatMoney(tournament.prizePoolMinor, tournament.currency) : 'Sponsors'}</MetricValue><MetricLabel>Premio</MetricLabel></Metric></Metrics>
    <Card><CardTitle>Próximos cruces</CardTitle><Bracket>{tournament.games.length > 0 ? tournament.games.map((game) => <Fixture key={game.id}><FixtureText>{game.match?.homeTeam?.name ?? 'A definir'} vs. {game.match?.awayTeam?.name ?? 'A definir'}</FixtureText><FixtureMeta>{game.round}{game.scheduledAt ? ` · ${formatMatchDate(game.scheduledAt)}` : ' · horario a confirmar'}</FixtureMeta></Fixture>) : <BodyText>La llave se publicará al cerrar la inscripción y validar los planteles.</BodyText>}</Bracket></Card>
    <Card><CardTitle>Reglas clave</CardTitle><BodyText>{tournament.rules}</BodyText><BodyText>Plantel máximo: {tournament.rosterLimit} jugadores.</BodyText></Card>
    <Card><CardTitle>Premios y transparencia</CardTitle><BodyText>Inscripción: {tournament.entryFeeMinor > 0 ? formatMoney(tournament.entryFeeMinor, tournament.currency) : 'sin cargo'}. La app mostrará fee, impuestos, neto y reglas de devolución antes de cualquier cobro. Hoy no procesa dinero.</BodyText></Card>
    <PrimaryButton label={requiresMoney && !tournament.paidCompetitionsEnabled ? 'Inscripción monetaria aún no habilitada' : registrationOpen ? selectedTeam ? `Preinscribir a ${selectedTeam.name}` : 'Necesitás un equipo compatible' : 'Inscripción cerrada'} icon="trophy-outline" loading={loading} disabled={loading || !registrationEnabled || !selectedTeam} onPress={() => { void register(); }} />
  </ScrollScreen>;
}
