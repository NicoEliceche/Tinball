import type { MatchFormat, Position, SkillLevel } from '@tinball/contracts';
import type { Lobby } from '../../types/lobby.types';
import type { Match, Team } from '../../types/match.types';
import type { CurrentPlayerProfile, Player, UserPreferences } from '../../types/player.types';
import type { RankingEntry, Reward, Venue } from '../../types/ranking.types';
import type { Conversation, FeedPost } from '../../types/social.types';
import { apiRequest } from '../client/apiClient';

interface ProfileResponse {
  id: string;
  rewardPoints: number;
  settings: UserPreferences | null;
  profile: null | {
    birthDate: string;
    nickname: string | null;
    locality: string;
    province: string;
    primaryPosition: Position;
    secondaryPositions: Position[];
    skillLevel: SkillLevel;
    preferredFoot: 'RIGHT' | 'LEFT' | 'BOTH';
    bio: string;
    ratingAverage: string | number;
    ratingCount: number;
    reliabilityScore: number;
  };
  teamMemberships: { role: string; team: { id: string; name: string; locality: string; crestColor: string | null; format: MatchFormat; rankPoints: number; isVerified: boolean; _count: { members: number } } }[];
  _count: { matchParticipations: number; referralsMade: number };
}

interface PlayerResponse extends Omit<Player, 'avatarUrl' | 'distanceKm' | 'rankPoints' | 'winRate'> {
  avatarUrl: string | null;
  distanceKm: number | null;
  rankPoints: number | null;
  winRate: number | null;
}

interface MatchResponse {
  id: string; title: string; format: MatchFormat; startsAt: string; locality: string; status: string;
  homeTeamId: string | null; awayTeamId: string | null;
  resultStatus: Match['resultStatus'];
  homeScore: number | null; awayScore: number | null;
  homeTeam: { name: string } | null; awayTeam: { name: string } | null; venue: { name: string } | null;
  participants: { userId: string; side: string | null; position: Position | null; status: string; checkedInAt: string | null; user: { id: string; displayName: string; avatarUrl: string | null } }[];
  lineupEntries: { userId: string; isStarter: boolean }[];
  conversationId: string | null;
  canManage: boolean;
}

interface FeedResponse {
  id: string; body: string; kind: FeedPost['kind']; createdAt: string;
  author: { displayName: string; avatarUrl: string | null };
  _count: { reactions: number; comments: number };
  reactions: { kind: string }[];
}

interface RankingResponse {
  period: null | { entries: { userId: string; locality: string; points: number; position: number | null; matches: number; user: { displayName: string; avatarUrl: string | null } }[] };
}

interface RewardResponse { id: string; title: string; sponsor: string; pointsCost: number; stock: number; category: string }
interface VenueResponse { id: string; name: string; locality: string; address: string; ratingAverage: string | number; ratingCount: number; surface: string | null; isSponsored: boolean; fields: { format: MatchFormat; indoor: boolean }[] }
interface ConversationResponse { id: string; kind: Conversation['kind'] | 'SUPPORT'; scopeRefId: string | null; title: string; lastMessage: { text: string; createdAt: string } | null; lastReadAt: string | null }

export interface ProductData {
  currentProfile: CurrentPlayerProfile | null;
  rewardPoints: number;
  settings: UserPreferences;
  players: Player[];
  lobbies: Lobby[];
  matches: Match[];
  teams: Team[];
  feed: FeedPost[];
  rankings: RankingEntry[];
  rewards: Reward[];
  venues: Venue[];
  conversations: Conversation[];
}

const matchStatus = (status: string): Match['status'] => {
  if (status === 'DRAFT' || status === 'DISPUTED') return status;
  if (status === 'CALLING' || status === 'CONFIRMED' || status === 'LIVE' || status === 'COMPLETED' || status === 'CANCELLED') return status;
  return 'CALLING';
};

async function safeRequest<T>(label: string, request: Promise<T>, fallback: T): Promise<T> {
  try {
    return await request;
  } catch (error) {
    console.warn(`Tinball bootstrap fallback for ${label}.`, error);
    return fallback;
  }
}

export async function loadProductData(): Promise<ProductData> {
  const emptyProfile: ProfileResponse = {
    id: '',
    rewardPoints: 0,
    settings: null,
    profile: null,
    teamMemberships: [],
    _count: { matchParticipations: 0, referralsMade: 0 },
  };
  const [profile, playerPage, lobbyPage, matchPage, feedPage, rankingPage, rewardPage, venuePage, conversationPage] = await Promise.all([
    safeRequest('profile', apiRequest<ProfileResponse>('/api/v1/profile/me', { timeoutMs: 30_000 }), emptyProfile),
    safeRequest('players', apiRequest<{ items: PlayerResponse[] }>('/api/v1/players/discover', { timeoutMs: 30_000 }), { items: [] }),
    safeRequest('lobbies', apiRequest<{ items: Lobby[] }>('/api/v1/lobbies?limit=50', { timeoutMs: 30_000 }), { items: [] }),
    safeRequest('matches', apiRequest<{ items: MatchResponse[] }>('/api/v1/matches/me', { timeoutMs: 30_000 }), { items: [] }),
    safeRequest('feed', apiRequest<{ items: FeedResponse[] }>('/api/v1/feed?limit=50', { timeoutMs: 30_000 }), { items: [] }),
    safeRequest('rankings', apiRequest<RankingResponse>('/api/v1/rankings/current', { timeoutMs: 30_000 }), { period: null }),
    safeRequest('rewards', apiRequest<{ items: RewardResponse[] }>('/api/v1/rewards', { timeoutMs: 30_000 }), { items: [] }),
    safeRequest('venues', apiRequest<{ items: VenueResponse[] }>('/api/v1/venues?limit=50', { timeoutMs: 30_000 }), { items: [] }),
    safeRequest('conversations', apiRequest<{ items: ConversationResponse[] }>('/api/v1/conversations', { timeoutMs: 30_000 }), { items: [] }),
  ]);

  const rankings = (rankingPage.period?.entries ?? []).map((entry, index) => ({
    position: index + 1,
    userId: entry.userId,
    displayName: entry.user.displayName,
    avatarUrl: entry.user.avatarUrl ?? '',
    locality: entry.locality,
    rankPoints: entry.points,
    movement: 0,
    matches: entry.matches,
  }));
  const rankByUser = new Map(rankings.map((entry) => [entry.userId, entry.rankPoints]));

  return {
    currentProfile: profile.profile ? {
      birthDate: profile.profile.birthDate.slice(0, 10),
      nickname: profile.profile.nickname ?? null,
      locality: profile.profile.locality,
      province: profile.profile.province,
      primaryPosition: profile.profile.primaryPosition,
      secondaryPositions: profile.profile.secondaryPositions,
      skillLevel: profile.profile.skillLevel,
      preferredFoot: profile.profile.preferredFoot,
      bio: profile.profile.bio,
      rating: Number(profile.profile.ratingAverage),
      reviewCount: profile.profile.ratingCount,
      reliability: profile.profile.reliabilityScore,
      matchesPlayed: profile._count.matchParticipations,
      referrals: profile._count.referralsMade,
    } : null,
    rewardPoints: profile.rewardPoints,
    settings: profile.settings ?? { themeMode: 'system', maxDistanceKm: 10, showExactDistance: false, pushMessages: true, pushMatches: true, pushRanking: true, notificationPreview: 'generic', allowDiscovery: true },
    players: playerPage.items.map((player) => ({ ...player, avatarUrl: player.avatarUrl ?? '', distanceKm: player.distanceKm ?? 0, rankPoints: rankByUser.get(player.id) ?? 1000, winRate: player.winRate ?? 0 })),
    lobbies: lobbyPage.items.map((lobby) => ({ ...lobby, organizerAvatar: lobby.organizerAvatar ?? '' })),
    matches: matchPage.items.map((match) => ({
      id: match.id,
      title: match.title,
      homeTeam: match.homeTeam?.name ?? 'Equipo A',
      awayTeam: match.awayTeam?.name ?? 'Equipo B',
      homeTeamId: match.homeTeamId ?? undefined,
      awayTeamId: match.awayTeamId ?? undefined,
      homeScore: match.homeScore ?? undefined,
      awayScore: match.awayScore ?? undefined,
      format: match.format,
      startsAt: match.startsAt,
      venueName: match.venue?.name ?? 'Cancha a confirmar',
      locality: match.locality,
      status: matchStatus(match.status),
      resultStatus: match.resultStatus,
      conversationId: match.conversationId ?? `match-${match.id}`,
      canManage: match.canManage,
      players: match.participants.map((participant) => ({
        id: participant.userId,
        displayName: participant.user.displayName,
        avatarUrl: participant.user.avatarUrl ?? '',
        position: participant.position ?? 'MIDFIELDER',
        status: ['CONFIRMED', 'ATTENDED'].includes(participant.status) ? 'CONFIRMED' : participant.status === 'DECLINED' ? 'DECLINED' : participant.status === 'NO_SHOW' ? 'NO_SHOW' : 'PENDING',
        checkedIn: Boolean(participant.checkedInAt),
        isStarter: match.lineupEntries.some((entry) => entry.userId === participant.userId && entry.isStarter),
        side: participant.side === 'HOME' || participant.side === 'AWAY' ? participant.side : undefined,
      })),
    })),
    teams: profile.teamMemberships.map(({ role, team }) => ({ id: team.id, name: team.name, crestColor: team.crestColor ?? '#2FD05A', locality: team.locality, memberCount: team._count.members, format: team.format, wins: 0, losses: 0, draws: 0, rankPoints: team.rankPoints, isVerified: team.isVerified, canManage: role === 'CAPTAIN' || role === 'ADMIN', conversationId: conversationPage.items.find((conversation) => conversation.kind === 'TEAM' && conversation.scopeRefId === team.id)?.id ?? `team-${team.id}`, members: [] })),
    feed: feedPage.items.map((post) => ({ id: post.id, authorName: post.author.displayName, authorAvatar: post.author.avatarUrl ?? '', body: post.body, kind: post.kind, createdAt: post.createdAt, likes: post._count.reactions, comments: post._count.comments, liked: post.reactions.length > 0 })),
    rankings,
    rewards: rewardPage.items.map((reward) => ({ id: reward.id, title: reward.title, sponsor: reward.sponsor, points: reward.pointsCost, stock: reward.stock, category: reward.category })),
    venues: venuePage.items.map((venue) => ({ id: venue.id, name: venue.name, locality: venue.locality, address: venue.address, rating: Number(venue.ratingAverage), reviewCount: venue.ratingCount, formats: [...new Set(venue.fields.map((field) => field.format.replace('_A_SIDE', '').replace('FIVE', 'F5').replace('SEVEN', 'F7').replace('EIGHT', 'F8').replace('ELEVEN', 'F11')))], surface: venue.surface ?? 'A confirmar', priceLabel: 'Consultá disponibilidad', sponsored: venue.isSponsored })),
    conversations: conversationPage.items.map((conversation) => ({ id: conversation.id, title: conversation.title, subtitle: conversation.lastMessage?.text ?? 'Sin mensajes todavía', unreadCount: conversation.lastMessage && (!conversation.lastReadAt || new Date(conversation.lastMessage.createdAt) > new Date(conversation.lastReadAt)) ? 1 : 0, updatedAt: conversation.lastMessage?.createdAt ?? new Date(0).toISOString(), kind: conversation.kind === 'SUPPORT' ? 'LOBBY' : conversation.kind })),
  };
}
