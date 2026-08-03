import { create } from 'zustand';
import type { ProductData } from '../data/services/productService';
import type { Lobby } from '../types/lobby.types';
import type { Match, Team } from '../types/match.types';
import type { CurrentPlayerProfile, Player, PlayerReview, UserPreferences } from '../types/player.types';
import type { RankingEntry, Reward, Venue } from '../types/ranking.types';
import type { ChatMessage, Conversation, FeedPost } from '../types/social.types';
import {
  demoConversations,
  demoFeed,
  demoLobbies,
  demoMatches,
  demoMessages,
  demoPlayers,
  demoRankings,
  demoReviews,
  demoRewards,
  demoTeams,
  demoVenues,
} from '../data/mock/demoData';

interface TinballState {
  dataStatus: 'IDLE' | 'LOADING' | 'READY' | 'ERROR';
  dataError: string | null;
  currentProfile: CurrentPlayerProfile | null;
  settings: UserPreferences;
  players: Player[];
  lobbies: Lobby[];
  matches: Match[];
  teams: Team[];
  feed: FeedPost[];
  rankings: RankingEntry[];
  reviews: PlayerReview[];
  rewards: Reward[];
  venues: Venue[];
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  rewardPoints: number;
  connectedPlayerIds: string[];
  passedPlayerIds: string[];
  joinedLobbyIds: string[];
  loadDemoData: () => void;
  replaceServerData: (data: ProductData) => void;
  setDataLoading: () => void;
  setDataError: (message: string) => void;
  clearData: () => void;
  updateSettings: (settings: UserPreferences) => void;
  updateCurrentProfile: (profile: CurrentPlayerProfile) => void;
  togglePostLike: (postId: string) => void;
  addFeedPost: (post: FeedPost) => void;
  passPlayer: (playerId: string) => void;
  invitePlayer: (playerId: string) => void;
  joinLobby: (lobbyId: string) => void;
  addLobby: (lobby: Lobby) => void;
  sendMessage: (conversationId: string, text: string) => void;
  setConversationMessages: (conversationId: string, messages: ChatMessage[]) => void;
  appendMessage: (conversationId: string, message: ChatMessage) => void;
  submitReview: (review: Omit<PlayerReview, 'id' | 'createdAt' | 'verifiedAttendance'>) => void;
  setReviews: (reviews: PlayerReview[]) => void;
  redeemReward: (rewardId: string, points: number) => void;
  confirmMatchParticipation: (matchId: string, userId: string) => void;
  checkInMatchParticipation: (matchId: string, userId: string) => void;
  markNoShow: (matchId: string, userId: string) => void;
  updateTeam: (team: Team) => void;
  addTeam: (team: Team) => void;
  updateLineup: (matchId: string, starters: string[]) => void;
  setMatchResult: (matchId: string, homeScore: number, awayScore: number, resultStatus: NonNullable<Match['resultStatus']>) => void;
}

function makeClientId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useTinballStore = create<TinballState>((set) => ({
  dataStatus: 'IDLE',
  dataError: null,
  currentProfile: null,
  settings: { themeMode: 'system', maxDistanceKm: 10, showExactDistance: false, pushMessages: true, pushMatches: true, pushRanking: true, notificationPreview: 'generic', allowDiscovery: true },
  players: [],
  lobbies: [],
  matches: [],
  teams: [],
  feed: [],
  rankings: [],
  reviews: [],
  rewards: [],
  venues: [],
  conversations: [],
  messages: {},
  rewardPoints: 0,
  connectedPlayerIds: [],
  passedPlayerIds: [],
  joinedLobbyIds: [],
  loadDemoData: () => set({
    dataStatus: 'READY', dataError: null,
    currentProfile: { birthDate: '1998-05-12', locality: 'Palermo', province: 'Buenos Aires', primaryPosition: 'MIDFIELDER', secondaryPositions: ['FULLBACK'], skillLevel: 'INTERMEDIATE', preferredFoot: 'RIGHT', bio: 'Volante mixto, buen pase y juego limpio.', rating: 4.7, reviewCount: 38, reliability: 98, matchesPlayed: 54, referrals: 3 },
    settings: { themeMode: 'dark', maxDistanceKm: 10, showExactDistance: false, pushMessages: true, pushMatches: true, pushRanking: true, notificationPreview: 'generic', allowDiscovery: true },
    players: demoPlayers, lobbies: demoLobbies, matches: demoMatches, teams: demoTeams, feed: demoFeed, rankings: demoRankings, reviews: demoReviews, rewards: demoRewards, venues: demoVenues, conversations: demoConversations, messages: demoMessages, rewardPoints: 2380,
    connectedPlayerIds: [], passedPlayerIds: [], joinedLobbyIds: [],
  }),
  replaceServerData: (data) => set({ ...data, dataStatus: 'READY', dataError: null, reviews: [], messages: {}, connectedPlayerIds: [], passedPlayerIds: [], joinedLobbyIds: data.lobbies.filter((lobby) => lobby.myParticipationStatus === 'REQUESTED' || lobby.myParticipationStatus === 'CONFIRMED').map((lobby) => lobby.id) }),
  setDataLoading: () => set({ dataStatus: 'LOADING', dataError: null }),
  setDataError: (message) => set({ dataStatus: 'ERROR', dataError: message }),
  clearData: () => set({ dataStatus: 'IDLE', dataError: null, currentProfile: null, settings: { themeMode: 'system', maxDistanceKm: 10, showExactDistance: false, pushMessages: true, pushMatches: true, pushRanking: true, notificationPreview: 'generic', allowDiscovery: true }, players: [], lobbies: [], matches: [], teams: [], feed: [], rankings: [], reviews: [], rewards: [], venues: [], conversations: [], messages: {}, rewardPoints: 0, connectedPlayerIds: [], passedPlayerIds: [], joinedLobbyIds: [] }),
  updateSettings: (settings) => set({ settings }),
  updateCurrentProfile: (profile) => set({ currentProfile: profile }),
  togglePostLike: (postId) => set((state) => ({
    feed: state.feed.map((post) => post.id === postId
      ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) }
      : post),
  })),
  addFeedPost: (post) => set((state) => ({ feed: [post, ...state.feed] })),
  passPlayer: (playerId) => set((state) => ({ passedPlayerIds: [...state.passedPlayerIds, playerId] })),
  invitePlayer: (playerId) => set((state) => ({ connectedPlayerIds: [...state.connectedPlayerIds, playerId] })),
  joinLobby: (lobbyId) => set((state) => ({
    joinedLobbyIds: state.joinedLobbyIds.includes(lobbyId) ? state.joinedLobbyIds : [...state.joinedLobbyIds, lobbyId],
    lobbies: state.lobbies.map((lobby) => lobby.id === lobbyId
      ? { ...lobby, joinedPlayers: Math.min(lobby.requiredPlayers, lobby.joinedPlayers + 1), myParticipationStatus: 'REQUESTED' }
      : lobby),
  })),
  addLobby: (lobby) => set((state) => ({ lobbies: [lobby, ...state.lobbies], joinedLobbyIds: [...state.joinedLobbyIds, lobby.id] })),
  sendMessage: (conversationId, text) => set((state) => {
    const id = makeClientId('message');
    const message: ChatMessage = {
      id,
      clientId: id,
      senderId: 'demo-user',
      senderName: 'Nico',
      text: text.trim(),
      createdAt: new Date().toISOString(),
      status: 'SENT',
    };
    return { messages: { ...state.messages, [conversationId]: [...(state.messages[conversationId] ?? []), message] } };
  }),
  setConversationMessages: (conversationId, messages) => set((state) => ({ messages: { ...state.messages, [conversationId]: messages } })),
  appendMessage: (conversationId, message) => set((state) => ({ messages: { ...state.messages, [conversationId]: [...(state.messages[conversationId] ?? []), message] } })),
  submitReview: (review) => set((state) => ({
    reviews: [{ ...review, id: makeClientId('review'), createdAt: new Date().toISOString(), verifiedAttendance: true }, ...state.reviews],
  })),
  setReviews: (reviews) => set({ reviews }),
  redeemReward: (rewardId, points) => set((state) => ({ rewardPoints: Math.max(0, state.rewardPoints - points), rewards: state.rewards.map((reward) => reward.id === rewardId ? { ...reward, stock: Math.max(0, reward.stock - 1) } : reward) })),
  confirmMatchParticipation: (matchId, userId) => set((state) => ({ matches: state.matches.map((match) => match.id === matchId ? { ...match, players: match.players.map((player) => player.id === userId ? { ...player, status: 'CONFIRMED' } : player) } : match) })),
  checkInMatchParticipation: (matchId, userId) => set((state) => ({ matches: state.matches.map((match) => match.id === matchId ? { ...match, players: match.players.map((player) => player.id === userId ? { ...player, checkedIn: true } : player) } : match) })),
  markNoShow: (matchId, userId) => set((state) => ({ matches: state.matches.map((match) => match.id === matchId ? { ...match, players: match.players.map((player) => player.id === userId ? { ...player, status: 'NO_SHOW' } : player) } : match) })),
  updateTeam: (team) => set((state) => ({ teams: state.teams.map((current) => current.id === team.id ? team : current) })),
  addTeam: (team) => set((state) => ({ teams: [team, ...state.teams] })),
  updateLineup: (matchId, starters) => set((state) => ({ matches: state.matches.map((match) => match.id === matchId ? { ...match, players: match.players.map((player) => ({ ...player, isStarter: starters.includes(player.id) })) } : match) })),
  setMatchResult: (matchId, homeScore, awayScore, resultStatus) => set((state) => ({ matches: state.matches.map((match) => match.id === matchId ? { ...match, homeScore, awayScore, resultStatus, status: resultStatus === 'DISPUTED' ? 'DISPUTED' : 'COMPLETED' } : match) })),
}));
