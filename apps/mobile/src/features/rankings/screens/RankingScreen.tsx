import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import type { RankingEntry } from '../../../core/types/ranking.types';
import { useTinballStore } from '../../../core/store/useTinballStore';
import { useAuth } from '../../../core/providers/AuthProvider';
import type { RootStackParamList } from '../../../navigation/types';
import { SectionHeader } from '../../../shared/components/SectionHeader';
import { StatusPill } from '../../../shared/components/StatusPill';
import { RankingRow } from '../components/RankingRow';
import { Copy, Header, List, MyRank, RankLabel, RankNumber, Row, Screen, Tab, Tabs, TabText, Title } from './RankingScreenStyled';
export function RankingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const rankings = useTinballStore((state) => state.rankings);
  const { auth } = useAuth();
  const [scope, setScope] = useState<'local' | 'general'>('local');
  const mine = rankings.find((entry) => entry.userId === auth?.user.id);
  const visibleRankings = useMemo(() => scope === 'local' && mine
    ? rankings.filter((entry) => entry.locality === mine.locality).map((entry, index) => ({ ...entry, position: index + 1 }))
    : rankings, [mine, rankings, scope]);
  const renderItem = useCallback(({ item }: { item: RankingEntry }) => <RankingRow entry={item} isMine={item.userId === auth?.user.id} onPress={() => navigation.navigate('PlayerProfile', { playerId: item.userId })} />, [auth?.user.id, navigation]);
  const header = <Header><Title>Ranking</Title><Copy>Competencia justa: el ranking cambia por resultados y dificultad. Premium no compra ventaja deportiva.</Copy>{mine ? <MyRank><Row><RankNumber>#{mine.position}</RankNumber><StatusPill label={mine.movement === 0 ? 'Sin cambios' : `${mine.movement > 0 ? '▲' : '▼'} ${Math.abs(mine.movement)} este mes`} tone="primary" /></Row><RankLabel>{mine.rankPoints} Tinball Rank · {mine.locality}</RankLabel></MyRank> : null}<Tabs><Tab $active={scope === 'local'} onPress={() => setScope('local')}><TabText $active={scope === 'local'}>Mi localidad</TabText></Tab><Tab $active={scope === 'general'} onPress={() => setScope('general')}><TabText $active={scope === 'general'}>General</TabText></Tab></Tabs><SectionHeader title="Tabla mensual" subtitle="Actualiza al confirmar cada resultado" actionLabel="Premios" onAction={() => navigation.navigate('Rewards')} /></Header>;
  return <Screen><List data={visibleRankings} keyExtractor={(item) => item.userId} renderItem={renderItem} ListHeaderComponent={header} /></Screen>;
}
