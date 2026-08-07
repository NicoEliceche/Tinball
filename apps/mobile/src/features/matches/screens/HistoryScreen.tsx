import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import type { Match } from '../../../core/types/match.types';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { RootStackParamList } from '../../../navigation/types';
import { EmptyState } from '../../../shared/components/ScreenState';
import { BodyText, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { MatchCard } from '../components/MatchCard';
import { Header, List, Screen } from './HistoryScreenStyled';
export function HistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const matches = useTinballStore((state) => state.matches.filter((match) => match.status === 'COMPLETED' || match.status === 'CANCELLED'));
  const render = useCallback(({ item }: { item: Match }) => <MatchCard match={item} onPress={() => navigation.navigate('MatchDetail', { matchId: item.id })} />, [navigation]);
  return (
    <Screen>
      <List
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={render}
        ListHeaderComponent={<Header><ScreenTitle>Historial</ScreenTitle><BodyText>Resultados, asistencia y valoraciones de tus partidos verificados.</BodyText></Header>}
        ListEmptyComponent={<EmptyState title="Todavía no tenés historial" message="Cuando cierres tu primer partido, va a aparecer acá con resultado, asistencia y valoraciones." icon="time-outline" />}
      />
    </Screen>
  );
}
