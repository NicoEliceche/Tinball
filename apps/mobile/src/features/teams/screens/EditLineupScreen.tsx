import { UpdateLineupSchema } from '@tinball/contracts';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { RootStackParamList } from '../../../navigation/types';
import { Avatar } from '../../../shared/components/Avatar';
import { BodyText, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { StatusPill } from '../../../shared/components/StatusPill';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { positionLabels } from '../../../shared/utils/format';
import { Counter, CounterValue, ErrorText, PlayerCopy, PlayerMeta, PlayerName, PlayerRow } from './EditLineupScreenStyled';

const startersByFormat = { FIVE_A_SIDE: 5, SEVEN_A_SIDE: 7, EIGHT_A_SIDE: 8, ELEVEN_A_SIDE: 11 } as const;

export function EditLineupScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'EditLineup'>>();
  const navigation = useNavigation();
  const { isDemo } = useAuth();
  const match = useTinballStore((state) => state.matches.find((item) => item.id === route.params.matchId));
  const team = useTinballStore((state) => state.teams.find((item) => item.id === route.params.teamId));
  const updateLineup = useTinballStore((state) => state.updateLineup);
  const side = match?.homeTeamId === route.params.teamId ? 'HOME' : match?.awayTeamId === route.params.teamId ? 'AWAY' : 'HOME';
  const candidates = useMemo(() => match?.players.filter((player) => !player.side || player.side === side) ?? [], [match?.players, side]);
  const [starters, setStarters] = useState(() => candidates.filter((player) => player.isStarter).map((player) => player.id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  if (!match || !team) return <ScrollScreen><ScreenTitle>Formación no disponible</ScreenTitle></ScrollScreen>;
  const maximum = startersByFormat[match.format];

  const toggle = (playerId: string) => {
    setStarters((current) => current.includes(playerId) ? current.filter((id) => id !== playerId) : current.length < maximum ? [...current, playerId] : current);
  };
  const save = async () => {
    const input = { side, entries: candidates.map((player, order) => ({ userId: player.id, position: player.position, isStarter: starters.includes(player.id), order })) };
    const parsed = UpdateLineupSchema.safeParse(input);
    if (!parsed.success) {
      setError('La formación debe incluir al menos un jugador confirmado y no puede tener duplicados.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (!isDemo) await apiRequest(`/api/v1/matches/${match.id}/lineup`, { method: 'PUT', body: parsed.data });
      updateLineup(match.id, starters);
      Alert.alert('Formación guardada', 'El plantel verá los titulares y suplentes actualizados.', [{ text: 'Listo', onPress: () => navigation.goBack() }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos guardar la formación.');
    } finally {
      setSaving(false);
    }
  };

  return <ScrollScreen>
    <ScreenTitle>{team.name}</ScreenTitle>
    <BodyText>Tocá un jugador para moverlo entre titulares y suplentes. El límite corresponde a {match.format === 'FIVE_A_SIDE' ? 'fútbol 5' : match.format === 'SEVEN_A_SIDE' ? 'fútbol 7' : match.format === 'EIGHT_A_SIDE' ? 'fútbol 8' : 'fútbol 11'}.</BodyText>
    <Counter><CounterValue>{starters.length}/{maximum} titulares</CounterValue><BodyText>{candidates.length - starters.length} suplentes</BodyText></Counter>
    {candidates.map((player) => { const starter = starters.includes(player.id); return <PlayerRow key={player.id} $starter={starter} accessibilityRole="button" accessibilityState={{ selected: starter }} onPress={() => toggle(player.id)}><Avatar uri={player.avatarUrl} name={player.displayName} size={44} /><PlayerCopy><PlayerName>{player.displayName}</PlayerName><PlayerMeta>{positionLabels[player.position]}</PlayerMeta></PlayerCopy><StatusPill label={starter ? 'Titular' : 'Suplente'} tone={starter ? 'primary' : 'neutral'} /></PlayerRow>; })}
    {error ? <ErrorText accessibilityLiveRegion="polite">{error}</ErrorText> : null}
    <PrimaryButton label="Guardar formación" icon="grid-outline" loading={saving} disabled={saving || candidates.length === 0} onPress={() => { void save(); }} />
  </ScrollScreen>;
}
