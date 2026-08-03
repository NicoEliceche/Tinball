import type { MatchFormat, Position } from '@tinball/contracts';

export interface MatchPlayer {
  id: string;
  displayName: string;
  avatarUrl: string;
  position: Position;
  status: 'CONFIRMED' | 'PENDING' | 'DECLINED' | 'NO_SHOW';
  checkedIn?: boolean;
  isStarter: boolean;
  side?: 'HOME' | 'AWAY';
}

export interface Match {
  id: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeScore?: number;
  awayScore?: number;
  format: MatchFormat;
  startsAt: string;
  venueName: string;
  locality: string;
  status: 'DRAFT' | 'CALLING' | 'CONFIRMED' | 'LIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  resultStatus?: 'PENDING' | 'HOME_CONFIRMED' | 'AWAY_CONFIRMED' | 'CONFIRMED' | 'DISPUTED';
  conversationId: string;
  canManage?: boolean;
  players: MatchPlayer[];
}

export interface Team {
  id: string;
  name: string;
  crestColor: string;
  locality: string;
  memberCount: number;
  format: MatchFormat;
  wins: number;
  losses: number;
  draws: number;
  rankPoints: number;
  isVerified?: boolean;
  canManage?: boolean;
  conversationId: string;
  members: MatchPlayer[];
}
