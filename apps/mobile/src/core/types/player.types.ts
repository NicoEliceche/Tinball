import type { Position, SkillLevel } from '@tinball/contracts';

export interface Player {
  id: string;
  displayName: string;
  age: number;
  avatarUrl: string;
  locality: string;
  distanceKm: number;
  primaryPosition: Position;
  secondaryPositions: Position[];
  skillLevel: SkillLevel;
  preferredFoot: 'RIGHT' | 'LEFT' | 'BOTH';
  rating: number;
  reviewCount: number;
  reliability: number;
  rankPoints: number;
  matchesPlayed: number;
  winRate: number;
  bio: string;
  tags: string[];
  isPremium: boolean;
  isVerified: boolean;
}

export interface PlayerReview {
  id: string;
  authorName: string;
  rating: number;
  tags: string[];
  comment: string;
  matchLabel: string;
  createdAt: string;
  verifiedAttendance: boolean;
}

export interface CurrentPlayerProfile {
  birthDate: string;
  nickname?: string | null;
  locality: string;
  province: string;
  primaryPosition: Position;
  secondaryPositions: Position[];
  skillLevel: SkillLevel;
  preferredFoot: 'RIGHT' | 'LEFT' | 'BOTH';
  bio: string;
  rating: number;
  reviewCount: number;
  reliability: number;
  matchesPlayed: number;
  referrals: number;
}

export interface UserPreferences {
  themeMode: 'system' | 'dark' | 'light';
  maxDistanceKm: number;
  showExactDistance: boolean;
  pushMessages: boolean;
  pushMatches: boolean;
  pushRanking: boolean;
  notificationPreview: 'generic' | 'full' | 'hidden';
  allowDiscovery: boolean;
}
