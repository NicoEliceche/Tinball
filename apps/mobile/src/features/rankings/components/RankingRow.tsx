import type { RankingEntry } from '../../../core/types/ranking.types';
import { Avatar } from '../../../shared/components/Avatar';
import { Copy, Meta, Movement, Name, Points, Position, Row } from './RankingRowStyled';
export function RankingRow({ entry, isMine = false, onPress }: { entry: RankingEntry; isMine?: boolean; onPress: () => void }) {
  return <Row $mine={isMine} accessibilityRole="button" accessibilityLabel={`Puesto ${entry.position}, ${entry.displayName}, ${entry.rankPoints} puntos`} onPress={onPress}><Position>{entry.position}</Position><Avatar uri={entry.avatarUrl} name={entry.displayName} size={42} /><Copy><Name>{entry.displayName}</Name><Meta>{entry.locality} · {entry.matches} partidos</Meta></Copy><Copy><Points>{entry.rankPoints}</Points>{entry.movement !== 0 ? <Movement $up={entry.movement > 0}>{entry.movement > 0 ? '▲' : '▼'} {Math.abs(entry.movement)}</Movement> : <Meta>—</Meta>}</Copy></Row>;
}
