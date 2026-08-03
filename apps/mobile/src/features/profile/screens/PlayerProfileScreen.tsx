import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { Player } from '../../../core/types/player.types';
import type { RootStackParamList } from '../../../navigation/types';
import { Avatar } from '../../../shared/components/Avatar';
import { BodyText, Card, CardTitle, Metric, MetricLabel, Metrics, MetricValue, ScreenTitle, WrapRow } from '../../../shared/components/DetailPrimitives';
import { FootballRating } from '../../../shared/components/FootballRating';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { StatusPill } from '../../../shared/components/StatusPill';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { positionLabels, skillLabels } from '../../../shared/utils/format';
import { Bio, Header, Link, LinkText, Name, Tags } from './PlayerProfileScreenStyled';

interface PlayerResponse extends Omit<Player, 'avatarUrl' | 'distanceKm' | 'rankPoints' | 'winRate'> {
  avatarUrl: string | null; distanceKm: number | null; rankPoints: number | null; winRate: number | null;
  isBlocked: boolean;
}

export function PlayerProfileScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'PlayerProfile'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { auth, isDemo } = useAuth();
  const cached = useTinballStore((state) => state.players.find((item) => item.id === route.params.playerId));
  const ranking = useTinballStore((state) => state.rankings.find((item) => item.userId === route.params.playerId));
  const invitePlayer = useTinballStore((state) => state.invitePlayer);
  const [player, setPlayer] = useState<Player | null>(cached ?? null);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isDemo) return;
    let active = true;
    apiRequest<PlayerResponse>(`/api/v1/players/${route.params.playerId}`)
      .then((response) => { if (active) { setPlayer({ ...response, avatarUrl: response.avatarUrl ?? '', distanceKm: response.distanceKm ?? 0, rankPoints: ranking?.rankPoints ?? response.rankPoints ?? 1000, winRate: response.winRate ?? 0 }); setBlocked(response.isBlocked); } })
      .catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : 'No pudimos cargar el perfil.'); });
    return () => { active = false; };
  }, [isDemo, ranking?.rankPoints, route.params.playerId]);

  if (!player) return <ScrollScreen><ScreenTitle>{error || 'Cargando perfil…'}</ScreenTitle></ScrollScreen>;
  const isOwnProfile = player.id === auth?.user.id;
  const invite = async () => {
    try {
      if (!isDemo) await apiRequest(`/api/v1/players/${player.id}/invite`, { method: 'POST', body: { contextType: 'CONNECT', note: '' } });
      invitePlayer(player.id);
      Alert.alert('Invitación enviada', `${player.displayName} recibió tu invitación.`);
    } catch (caught) {
      Alert.alert('No pudimos enviar la invitación', caught instanceof Error ? caught.message : 'Intentá nuevamente.');
    }
  };

  const toggleBlock = () => {
    const apply = async () => {
      try {
        if (!isDemo) await apiRequest(`/api/v1/players/${player.id}/block`, { method: blocked ? 'DELETE' : 'POST', ...(blocked ? {} : { body: {} }) });
        setBlocked((current) => !current);
        Alert.alert(blocked ? 'Jugador desbloqueado' : 'Jugador bloqueado', blocked ? 'Volverá a aparecer en búsquedas compatibles.' : 'No podrán descubrirse, invitarse ni verse en el feed. Los reportes se gestionan por separado.');
      } catch (caught) {
        Alert.alert('No pudimos actualizar el bloqueo', caught instanceof Error ? caught.message : 'Intentá nuevamente.');
      }
    };
    if (blocked) { void apply(); return; }
    Alert.alert('Bloquear jugador', `¿Querés bloquear a ${player.displayName}? Las invitaciones pendientes entre ambos se cancelarán.`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Bloquear', style: 'destructive', onPress: () => { void apply(); } }]);
  };

  return <ScrollScreen>
    <Header><Avatar uri={player.avatarUrl} name={player.displayName} size={116} /><Name>{player.displayName}, {player.age}</Name><WrapRow><StatusPill label={player.isVerified ? 'Identidad verificada' : 'Perfil deportivo'} tone="primary" icon="shield-checkmark-outline" />{player.isPremium ? <StatusPill label="Premium" tone="warning" icon="diamond-outline" /> : null}</WrapRow><BodyText>{positionLabels[player.primaryPosition]} · {skillLabels[player.skillLevel]} · {player.locality}{player.distanceKm > 0 ? ` · ${player.distanceKm.toFixed(1)} km` : ''}</BodyText><FootballRating value={player.rating} count={player.reviewCount} /><Bio>{player.bio}</Bio><Tags>{player.tags.map((tag) => <StatusPill key={tag} label={tag} />)}</Tags></Header>
    <Metrics><Metric><MetricValue>{ranking?.position ? `#${ranking.position}` : '—'}</MetricValue><MetricLabel>Ranking local</MetricLabel></Metric><Metric><MetricValue>{player.winRate > 0 ? `${player.winRate}%` : '—'}</MetricValue><MetricLabel>Victorias</MetricLabel></Metric><Metric><MetricValue>{player.reliability}%</MetricValue><MetricLabel>Confiabilidad</MetricLabel></Metric></Metrics>
    <Card><CardTitle>Perfil futbolístico</CardTitle><BodyText>{positionLabels[player.primaryPosition]} · Pie {player.preferredFoot === 'LEFT' ? 'izquierdo' : player.preferredFoot === 'BOTH' ? 'ambos' : 'derecho'}</BodyText><BodyText>{player.matchesPlayed} partidos verificados · {player.rankPoints} Tinball Rank</BodyText></Card>
    <Link accessibilityRole="link" onPress={() => navigation.navigate('Reviews', { playerId: player.id })}><LinkText>Ver las {player.reviewCount} valoraciones</LinkText></Link>
    {!isOwnProfile && !blocked ? <PrimaryButton label="Invitar a un partido" icon="person-add-outline" onPress={() => { void invite(); }} /> : null}
    {!isOwnProfile ? <PrimaryButton label={blocked ? 'Desbloquear jugador' : 'Bloquear jugador'} icon={blocked ? 'lock-open-outline' : 'ban-outline'} variant="ghost" onPress={toggleBlock} /> : null}
    {!isOwnProfile ? <PrimaryButton label="Reportar jugador" icon="shield-outline" variant="ghost" onPress={() => navigation.navigate('Report', { targetType: 'USER', targetId: player.id, reportedUserId: player.id })} /> : null}
  </ScrollScreen>;
}
