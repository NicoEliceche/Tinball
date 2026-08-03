export interface TournamentSummary {
  id: string;
  name: string;
  cadence: 'QUINCENAL' | 'MENSUAL' | 'SEMESTRAL';
  format: string;
  locality: string;
  startsAt: string;
  registeredTeams: number;
  maxTeams: number;
  entryFeeLabel: string;
  prizeLabel: string;
  status: 'OPEN' | 'COMING_SOON';
}

