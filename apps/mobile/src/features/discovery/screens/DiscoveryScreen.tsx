import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useTheme } from 'styled-components/native';
import type { Lobby } from '../../../core/types/lobby.types';
import type { Player } from '../../../core/types/player.types';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { MainTabParamList, RootStackParamList } from '../../../navigation/types';
import { EmptyState } from '../../../shared/components/ScreenState';
import { positionLabels } from '../../../shared/utils/format';
import { LobbyCard } from '../../lobbies/components/LobbyCard';
import { PlayerCard } from '../components/PlayerCard';
import { Content, Copy, Filter, FilterRow, FilterText, Header, Hint, LobbyList, PlayerArea, Screen, Segment, Segments, SegmentText, Title } from './DiscoveryScreenStyled';

const positionOptions: (Player['primaryPosition'] | undefined)[] = [undefined, 'GOALKEEPER', 'DEFENDER', 'FULLBACK', 'MIDFIELDER', 'WINGER', 'FORWARD'];
const lobbyModeOptions: (Lobby['mode'] | undefined)[] = [undefined, 'NEED_ONE', 'OPEN', 'PREMADE'];
const lobbyModeLabels: Record<Lobby['mode'], string> = { NEED_ONE: 'Falta uno', OPEN: 'Abierto', PREMADE: 'Premades', PRIZE: 'Con premio' };

export function DiscoveryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<MainTabParamList, 'Discover'>>();
  const theme = useTheme();
  const { isDemo } = useAuth();
  const [mode, setMode] = useState<'players' | 'lobbies'>('players');
  const [positionFilter, setPositionFilter] = useState<Player['primaryPosition'] | undefined>();
  const [lobbyModeFilter, setLobbyModeFilter] = useState<Lobby['mode'] | undefined>();
  const players = useTinballStore((state) => state.players);
  const lobbies = useTinballStore((state) => state.lobbies);
  const passed = useTinballStore((state) => state.passedPlayerIds);
  const connected = useTinballStore((state) => state.connectedPlayerIds);
  const passPlayer = useTinballStore((state) => state.passPlayer);
  const invitePlayer = useTinballStore((state) => state.invitePlayer);
  const teamContextId = route.params?.teamId;
  const lobbyContextId = route.params?.lobbyId;
  const profileLocality = useTinballStore((state) => state.currentProfile?.locality);
  const current = useMemo(() => players.find((player) => !passed.includes(player.id) && !connected.includes(player.id) && (!positionFilter || player.primaryPosition === positionFilter)), [connected, passed, players, positionFilter]);
  const visibleLobbies = useMemo(() => lobbies.filter((lobby) => (!profileLocality || lobby.locality.toLocaleLowerCase() === profileLocality.toLocaleLowerCase()) && (!lobbyModeFilter || lobby.mode === lobbyModeFilter)), [lobbies, lobbyModeFilter, profileLocality]);
  const cyclePosition = () => setPositionFilter((currentValue) => positionOptions[(positionOptions.indexOf(currentValue) + 1) % positionOptions.length]);
  const cycleLobbyMode = () => setLobbyModeFilter((currentValue) => lobbyModeOptions[(lobbyModeOptions.indexOf(currentValue) + 1) % lobbyModeOptions.length]);
  const renderLobby = useCallback(({ item }: { item: Lobby }) => <LobbyCard lobby={item} onPress={() => navigation.navigate('LobbyDetail', { lobbyId: item.id })} />, [navigation]);
  const inviteCurrent = useCallback(async () => {
    if (!current) return;
    try {
      const contextType = teamContextId ? 'TEAM' : lobbyContextId ? 'LOBBY' : 'CONNECT';
      const contextId = teamContextId ?? lobbyContextId;
      if (!isDemo) await apiRequest(`/api/v1/players/${current.id}/invite`, { method: 'POST', body: { contextType, ...(contextId ? { contextId } : {}), note: '' } });
      invitePlayer(current.id);
      Alert.alert('Invitación enviada', `${current.displayName} podrá aceptar desde su bandeja.`);
    } catch (caught) {
      Alert.alert('No pudimos enviar la invitación', caught instanceof Error ? caught.message : 'Intentá nuevamente.');
    }
  }, [current, invitePlayer, isDemo, lobbyContextId, teamContextId]);
  return (
    <Screen><Content>
      <Header><Title>Buscar</Title><Copy>{teamContextId ? 'Elegí jugadores para invitar a tu equipo.' : lobbyContextId ? 'Buscá el perfil que falta para completar tu lobby.' : 'Jugadores y partidos cerca de tu zona.'}</Copy></Header>
      <Segments><Segment $selected={mode === 'players'} accessibilityRole="tab" accessibilityState={{ selected: mode === 'players' }} onPress={() => setMode('players')}><SegmentText $selected={mode === 'players'}>Me falta uno</SegmentText></Segment><Segment $selected={mode === 'lobbies'} accessibilityRole="tab" accessibilityState={{ selected: mode === 'lobbies' }} onPress={() => setMode('lobbies')}><SegmentText $selected={mode === 'lobbies'}>Lobbies</SegmentText></Segment></Segments>
      <FilterRow><Filter><Ionicons name="location-outline" size={17} color={theme.colors.textSecondary} /><FilterText>{profileLocality ?? 'Mi localidad'}</FilterText></Filter><Filter accessibilityRole="button" accessibilityLabel="Cambiar filtro" onPress={mode === 'players' ? cyclePosition : cycleLobbyMode}><Ionicons name="options-outline" size={17} color={theme.colors.textSecondary} /><FilterText>{mode === 'players' ? positionFilter ? positionLabels[positionFilter] : 'Todas las posiciones' : lobbyModeFilter ? lobbyModeLabels[lobbyModeFilter] : 'Todos los lobbies'}</FilterText></Filter></FilterRow>
      {mode === 'players' ? <PlayerArea>{current ? <PlayerCard player={current} onOpen={() => navigation.navigate('PlayerProfile', { playerId: current.id })} onPass={() => passPlayer(current.id)} onInvite={() => { void inviteCurrent(); }} /> : <EmptyState title="No quedan perfiles con este filtro" message="Cambiá la posición o volvé más tarde para nuevas sugerencias." />}<Hint>También podés deslizar, pero los botones siempre están disponibles.</Hint></PlayerArea> : <LobbyList data={visibleLobbies} keyExtractor={(item) => item.id} renderItem={renderLobby} ListEmptyComponent={<EmptyState title="No hay lobbies compatibles" message="Probá otro tipo o creá una convocatoria en tu localidad." />} />}
    </Content></Screen>
  );
}
