import type { Match } from '../../../core/types/match.types';
import { StatusPill } from '../../../shared/components/StatusPill';
import { formatLabels, formatMatchDate } from '../../../shared/utils/format';
import { AwayTeam, Card, Header, Label, Meta, Score, Team, Teams, Versus } from './MatchCardStyled';
const statusLabels: Record<Match['status'], string> = { DRAFT: 'Borrador', CALLING: 'Convocando', CONFIRMED: 'Confirmado', LIVE: 'En vivo', COMPLETED: 'Finalizado', CANCELLED: 'Cancelado', DISPUTED: 'En disputa' };
export function MatchCard({ match, onPress }: { match: Match; onPress: () => void }) {
  const played = match.homeScore !== undefined && match.awayScore !== undefined;
  return (
    <Card accessibilityRole="button" accessibilityLabel={`${match.homeTeam} contra ${match.awayTeam}, ${statusLabels[match.status]}`} onPress={onPress}>
      <Header><Label>{match.title}</Label><StatusPill label={statusLabels[match.status]} tone={match.status === 'COMPLETED' ? 'neutral' : match.status === 'LIVE' ? 'danger' : 'primary'} /></Header>
      <Teams><Team>{match.homeTeam}</Team>{played ? <Score>{match.homeScore} — {match.awayScore}</Score> : <Versus>VS</Versus>}<AwayTeam>{match.awayTeam}</AwayTeam></Teams>
      <Meta>{formatMatchDate(match.startsAt)} · {match.venueName}</Meta>
      <Meta>{formatLabels[match.format]} · {match.locality}</Meta>
    </Card>
  );
}
