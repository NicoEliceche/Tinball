import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Discover: { teamId?: string; lobbyId?: string } | undefined;
  Matches: undefined;
  Ranking: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Onboarding: undefined;
  PlayerProfile: { playerId: string };
  LobbyDetail: { lobbyId: string };
  CreateLobby: undefined;
  MatchDetail: { matchId: string };
  ChatRoom: { conversationId: string; title: string };
  TeamDetail: { teamId: string };
  Teams: undefined;
  EditLineup: { teamId: string; matchId: string };
  CreateTeam: undefined;
  SubmitResult: { matchId: string };
  MatchCheckIn: { matchId: string };
  ManageNoShows: { matchId: string };
  Tournaments: undefined;
  TournamentDetail: { tournamentId: string };
  Premium: undefined;
  Rewards: undefined;
  Venues: undefined;
  Referrals: undefined;
  Reviews: { playerId: string };
  History: undefined;
  Notifications: undefined;
  CreatePost: undefined;
  Report: { targetType: 'USER' | 'MATCH' | 'LOBBY' | 'MESSAGE' | 'POST' | 'REVIEW'; targetId?: string; reportedUserId?: string };
  Settings: undefined;
  EditProfile: undefined;
  BlockedPlayers: undefined;
  ReviewPlayer: { playerId: string; matchId: string };
  Conversations: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
