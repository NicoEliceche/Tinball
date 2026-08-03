import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import type { RootStackParamList } from '../../../navigation/types';
import { BodyText, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { StatusPill } from '../../../shared/components/StatusPill';
import { formatLabels, formatMatchDate, formatMoney } from '../../../shared/utils/format';
import type { TournamentSummary } from '../types/tournament.types';
import { Card, Fill, Header, List, Meta, Name, Prize, Progress, Screen } from './TournamentsScreenStyled';

const demoTournaments: TournamentSummary[] = [
  { id: 't-aug-biweekly', name: 'Copa Tinball Agosto', cadence: 'QUINCENAL', format: 'Fútbol 7', locality: 'CABA', startsAt: '2026-08-15T10:00:00-03:00', registeredTeams: 24, maxTeams: 32, entryFeeLabel: '$50.000 por equipo', prizeLabel: 'Premio estimado $1.000.000', status: 'OPEN' },
  { id: 't-sep-monthly', name: 'Liga Metropolitana', cadence: 'MENSUAL', format: 'Fútbol 5', locality: 'AMBA', startsAt: '2026-09-05T09:00:00-03:00', registeredTeams: 18, maxTeams: 32, entryFeeLabel: 'Inscripción próximamente', prizeLabel: 'Premios de sponsors', status: 'COMING_SOON' },
  { id: 't-dec-finals', name: 'Final de Campeones', cadence: 'SEMESTRAL', format: 'Fútbol 7', locality: 'Buenos Aires', startsAt: '2026-12-12T10:00:00-03:00', registeredTeams: 8, maxTeams: 16, entryFeeLabel: 'Clasificación por ranking', prizeLabel: 'Gran premio anual', status: 'COMING_SOON' },
];
interface TournamentResponse { id: string; name: string; cadence: 'BIWEEKLY' | 'MONTHLY' | 'SEMIANNUAL' | 'ANNUAL'; status: string; format: keyof typeof formatLabels; locality: string; startsAt: string; maxTeams: number; entryFeeMinor: number; prizePoolMinor: number; currency: string; _count: { entries: number } }

export function TournamentsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDemo } = useAuth();
  const [tournaments, setTournaments] = useState<TournamentSummary[]>(isDemo ? demoTournaments : []);
  const [error, setError] = useState('');
  useEffect(() => {
    if (isDemo) return;
    let active = true;
    apiRequest<{ items: TournamentResponse[] }>('/api/v1/tournaments')
      .then((response) => { if (active) setTournaments(response.items.map((item) => ({ id: item.id, name: item.name, cadence: item.cadence === 'BIWEEKLY' ? 'QUINCENAL' : item.cadence === 'MONTHLY' ? 'MENSUAL' : 'SEMESTRAL', format: formatLabels[item.format], locality: item.locality, startsAt: item.startsAt, registeredTeams: item._count.entries, maxTeams: item.maxTeams, entryFeeLabel: item.entryFeeMinor > 0 ? `${formatMoney(item.entryFeeMinor, item.currency)} por equipo` : 'Sin costo informado', prizeLabel: item.prizePoolMinor > 0 ? `Premio ${formatMoney(item.prizePoolMinor, item.currency)}` : 'Premios de sponsors', status: item.status === 'REGISTRATION_OPEN' ? 'OPEN' : 'COMING_SOON' }))); })
      .catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : 'No pudimos cargar los torneos.'); });
    return () => { active = false; };
  }, [isDemo]);
  const render = useCallback(({ item }: { item: TournamentSummary }) => <Card accessibilityRole="button" onPress={() => navigation.navigate('TournamentDetail', { tournamentId: item.id })}><StatusPill label={item.cadence === 'QUINCENAL' ? 'Quincenal' : item.cadence === 'MENSUAL' ? 'Mensual' : 'Semestral'} tone={item.status === 'OPEN' ? 'primary' : 'neutral'} /><Name>{item.name}</Name><Prize>{item.prizeLabel}</Prize><Meta>{item.format} · {item.locality} · {formatMatchDate(item.startsAt)}</Meta><Progress><Fill $value={item.registeredTeams / item.maxTeams * 100} /></Progress><Meta>{item.registeredTeams}/{item.maxTeams} equipos · {item.entryFeeLabel}</Meta></Card>, [navigation]);
  return <Screen><List data={tournaments} keyExtractor={(item) => item.id} renderItem={render} ListHeaderComponent={<Header><ScreenTitle>Torneos</ScreenTitle><BodyText>{error || 'Competencias quincenales, mensuales y la gran final. Las liquidaciones monetarias sólo se activarán con cumplimiento legal y escrow.'}</BodyText></Header>} /></Screen>;
}
