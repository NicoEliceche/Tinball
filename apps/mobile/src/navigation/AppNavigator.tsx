import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import { ChatRoomScreen, ConversationsScreen } from '../features/chat';
import { DiscoveryScreen } from '../features/discovery';
import { CreatePostScreen, HomeScreen } from '../features/home';
import { CreateLobbyScreen, LobbyDetailScreen } from '../features/lobbies';
import { CheckInScreen, HistoryScreen, ManageNoShowsScreen, MatchDetailScreen, MatchesScreen, ReviewPlayerScreen, SubmitResultScreen } from '../features/matches';
import { NotificationsScreen } from '../features/notifications';
import { PremiumScreen } from '../features/premium';
import { BlockedPlayersScreen, EditProfileScreen, PlayerProfileScreen, ProfileScreen, ReferralsScreen, ReportScreen, ReviewsScreen, SettingsScreen } from '../features/profile';
import { RankingScreen } from '../features/rankings';
import { RewardsScreen } from '../features/rewards';
import { CreateTeamScreen, EditLineupScreen, TeamDetailScreen, TeamsScreen } from '../features/teams';
import { TournamentDetailScreen, TournamentsScreen } from '../features/tournaments';
import { VenuesScreen } from '../features/venues';
import type { MainTabParamList, RootStackParamList } from './types';

const Tabs = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const tabLabels: Record<keyof MainTabParamList, string> = { Home: 'Inicio', Discover: 'Buscar', Matches: 'Partidos', Ranking: 'Ranking', Profile: 'Perfil' };
const tabIcons: Record<keyof MainTabParamList, { outline: keyof typeof Ionicons.glyphMap; filled: keyof typeof Ionicons.glyphMap }> = {
  Home: { outline: 'home-outline', filled: 'home' }, Discover: { outline: 'search-outline', filled: 'search' }, Matches: { outline: 'football-outline', filled: 'football' }, Ranking: { outline: 'podium-outline', filled: 'podium' }, Profile: { outline: 'person-outline', filled: 'person' },
};

function MainTabs() {
  const theme = useTheme(); const insets = useSafeAreaInsets(); const bottom = Math.max(insets.bottom, 6);
  return <Tabs.Navigator screenOptions={({ route }) => ({ headerShown: false, tabBarHideOnKeyboard: true, tabBarActiveTintColor: theme.colors.primary, tabBarInactiveTintColor: theme.colors.textMuted, tabBarLabel: tabLabels[route.name], tabBarLabelStyle: { fontFamily: theme.typography.family.semibold, fontSize: 11 }, tabBarStyle: { height: theme.layout.tabBarHeight + bottom, paddingTop: 6, paddingBottom: bottom, backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }, tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? tabIcons[route.name].filled : tabIcons[route.name].outline} size={23} color={color} /> })}>
    <Tabs.Screen name="Home" component={HomeScreen} /><Tabs.Screen name="Discover" component={DiscoveryScreen} /><Tabs.Screen name="Matches" component={MatchesScreen} /><Tabs.Screen name="Ranking" component={RankingScreen} /><Tabs.Screen name="Profile" component={ProfileScreen} />
  </Tabs.Navigator>;
}

export function AppNavigator() {
  const theme = useTheme();
  const navigationTheme = useMemo(() => ({ ...(theme.dark ? DarkTheme : DefaultTheme), colors: { ...(theme.dark ? DarkTheme.colors : DefaultTheme.colors), primary: theme.colors.primary, background: theme.colors.background, card: theme.colors.surface, text: theme.colors.text, border: theme.colors.border, notification: theme.colors.danger } }), [theme]);
  const screenOptions = { headerStyle: { backgroundColor: theme.colors.surface }, headerTintColor: theme.colors.text, headerTitleStyle: { fontFamily: theme.typography.family.display }, headerShadowVisible: false, contentStyle: { backgroundColor: theme.colors.background }, animation: Platform.OS === 'android' ? 'fade_from_bottom' as const : 'default' as const };
  return <NavigationContainer theme={navigationTheme}><Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
    <Stack.Screen name="PlayerProfile" component={PlayerProfileScreen} options={{ title: 'Perfil de jugador' }} />
    <Stack.Screen name="LobbyDetail" component={LobbyDetailScreen} options={{ title: 'Lobby' }} />
    <Stack.Screen name="CreateLobby" component={CreateLobbyScreen} options={{ title: 'Crear lobby', presentation: 'modal' }} />
    <Stack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: 'Partido' }} />
    <Stack.Screen name="SubmitResult" component={SubmitResultScreen} options={{ title: 'Resultado', presentation: 'modal' }} />
    <Stack.Screen name="MatchCheckIn" component={CheckInScreen} options={{ title: 'Check-in', presentation: 'modal' }} />
    <Stack.Screen name="ManageNoShows" component={ManageNoShowsScreen} options={{ title: 'Ausencias', presentation: 'modal' }} />
    <Stack.Screen name="ChatRoom" component={ChatRoomScreen} options={({ route }) => ({ title: route.params.title })} />
    <Stack.Screen name="Conversations" component={ConversationsScreen} options={{ title: 'Chats' }} />
    <Stack.Screen name="TeamDetail" component={TeamDetailScreen} options={{ title: 'Mi equipo' }} />
    <Stack.Screen name="Teams" component={TeamsScreen} options={{ title: 'Mis equipos' }} />
    <Stack.Screen name="EditLineup" component={EditLineupScreen} options={{ title: 'Formación', presentation: 'modal' }} />
    <Stack.Screen name="CreateTeam" component={CreateTeamScreen} options={{ title: 'Crear equipo', presentation: 'modal' }} />
    <Stack.Screen name="Tournaments" component={TournamentsScreen} options={{ title: 'Torneos' }} />
    <Stack.Screen name="TournamentDetail" component={TournamentDetailScreen} options={{ title: 'Torneo' }} />
    <Stack.Screen name="Premium" component={PremiumScreen} options={{ title: 'Premium' }} />
    <Stack.Screen name="Rewards" component={RewardsScreen} options={{ title: 'Recompensas' }} />
    <Stack.Screen name="Venues" component={VenuesScreen} options={{ title: 'Canchas' }} />
    <Stack.Screen name="Referrals" component={ReferralsScreen} options={{ title: 'Referidos' }} />
    <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ title: 'Valoraciones' }} />
    <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historial' }} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificaciones' }} />
    <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: 'Nueva publicación', presentation: 'modal' }} />
    <Stack.Screen name="Report" component={ReportScreen} options={{ title: 'Reportar', presentation: 'modal' }} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configuración' }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Editar perfil' }} />
    <Stack.Screen name="BlockedPlayers" component={BlockedPlayersScreen} options={{ title: 'Bloqueos' }} />
    <Stack.Screen name="ReviewPlayer" component={ReviewPlayerScreen} options={{ title: 'Valorar jugador', presentation: 'modal' }} />
  </Stack.Navigator></NavigationContainer>;
}
