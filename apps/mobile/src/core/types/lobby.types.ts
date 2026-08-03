import type { LobbyMode, MatchFormat, Position, SkillLevel } from '@tinball/contracts';

export interface Lobby {
  id: string;
  title: string;
  organizerName: string;
  organizerId?: string;
  organizerAvatar: string;
  mode: LobbyMode;
  format: MatchFormat;
  locality: string;
  venueName: string;
  startsAt: string;
  durationMinutes: number;
  joinedPlayers: number;
  requiredPlayers: number;
  positionsNeeded: Position[];
  skillMin: SkillLevel;
  skillMax: SkillLevel;
  pricePerPlayerMinor: number;
  currency: string;
  commitmentScore: number;
  premiumOnly: boolean;
  status: 'OPEN' | 'FULL' | 'CONFIRMED';
  notes: string;
  myParticipationStatus?: 'REQUESTED' | 'CONFIRMED' | null;
  conversationId?: string | null;
}
