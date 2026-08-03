import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import { useTheme } from 'styled-components/native';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { RootStackParamList } from '../../../navigation/types';
import { Avatar } from '../../../shared/components/Avatar';
import { FootballRating } from '../../../shared/components/FootballRating';
import { StatusPill } from '../../../shared/components/StatusPill';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { positionLabels, skillLabels } from '../../../shared/utils/format';
import { CardText, CardTitle, DemoBanner, DemoText, Handle, Header, Menu, MenuRow, MenuText, Name, NameRow, PositionCard, Stat, StatLabel, Stats, StatValue } from './ProfileScreenStyled';
export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const { auth, isDemo, logout } = useAuth();
  const user = auth?.user;
  const profile = useTinballStore((state) => state.currentProfile);
  const rank = useTinballStore((state) => state.rankings.find((entry) => entry.userId === user?.id));
  const confirmLogout = () => Alert.alert('Cerrar sesión', '¿Querés salir de Tinball en este dispositivo?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Cerrar sesión', style: 'destructive', onPress: () => { void logout(); } }]);
  const rows: { label: string; icon: keyof typeof Ionicons.glyphMap; route: keyof RootStackParamList }[] = [
    { label: 'Editar perfil deportivo', icon: 'create-outline', route: 'EditProfile' }, { label: 'Mis valoraciones', icon: 'football-outline', route: 'Reviews' }, { label: 'Puntos y recompensas', icon: 'gift-outline', route: 'Rewards' },
    { label: 'Historial de partidos', icon: 'time-outline', route: 'History' }, { label: 'Invitar amigos', icon: 'people-outline', route: 'Referrals' },
    { label: 'Tinball Premium', icon: 'diamond-outline', route: 'Premium' }, { label: 'Configuración y seguridad', icon: 'settings-outline', route: 'Settings' },
  ];
  return <ScrollScreen>
    {isDemo ? <DemoBanner><DemoText>Modo demo: estos datos son locales y no representan una sesión de producción.</DemoText></DemoBanner> : null}
    <Header><Avatar uri={user?.avatarUrl ?? ''} name={user?.displayName ?? 'Jugador'} size={104} /><NameRow><Name>{user?.displayName ?? 'Jugador'}</Name><Ionicons name="shield-checkmark" size={21} color={theme.colors.primary} /></NameRow><Handle>{profile ? `${profile.locality} · ${profile.province}` : 'Perfil deportivo'}</Handle><FootballRating value={profile?.rating ?? 0} count={profile?.reviewCount ?? 0} /><StatusPill label={user?.isPremium ? 'Premium activo' : 'Cuenta verificada'} tone={user?.isPremium ? 'warning' : 'primary'} icon={user?.isPremium ? 'diamond-outline' : 'shield-checkmark-outline'} /></Header>
    <Stats><Stat><StatValue>{rank?.rankPoints ?? '—'}</StatValue><StatLabel>Tinball Rank</StatLabel></Stat><Stat><StatValue>{profile?.matchesPlayed ?? 0}</StatValue><StatLabel>Partidos</StatLabel></Stat><Stat><StatValue>{profile?.reliability ?? '—'}%</StatValue><StatLabel>Confiabilidad</StatLabel></Stat></Stats>
    {profile ? <PositionCard><CardTitle>{positionLabels[profile.primaryPosition]} · {skillLabels[profile.skillLevel]}</CardTitle><CardText>{profile.preferredFoot === 'RIGHT' ? 'Diestro' : profile.preferredFoot === 'LEFT' ? 'Zurdo' : 'Ambidiestro'} · {profile.secondaryPositions.length > 0 ? `También juega de ${profile.secondaryPositions.map((position) => positionLabels[position].toLowerCase()).join(', ')}` : 'Sin posición secundaria'} · {profile.matchesPlayed} partidos verificados</CardText></PositionCard> : null}
    <Menu>{rows.map((row) => <MenuRow key={row.label} accessibilityRole="button" accessibilityLabel={row.label} onPress={() => row.route === 'Reviews' ? navigation.navigate('Reviews', { playerId: user?.id ?? 'demo-user' }) : navigation.navigate(row.route as 'Rewards')}><Ionicons name={row.icon} size={21} color={theme.colors.textSecondary} /><MenuText>{row.label}</MenuText><Ionicons name="chevron-forward" size={19} color={theme.colors.textMuted} /></MenuRow>)}</Menu>
    <Menu><MenuRow $danger accessibilityRole="button" accessibilityLabel="Cerrar sesión" onPress={confirmLogout}><Ionicons name="log-out-outline" size={21} color={theme.colors.danger} /><MenuText $danger>Cerrar sesión</MenuText></MenuRow></Menu>
  </ScrollScreen>;
}
