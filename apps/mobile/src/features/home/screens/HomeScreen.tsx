import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTheme } from 'styled-components/native';
import { useAuth } from '../../../core/providers/AuthProvider';
import { apiRequest } from '../../../core/data/client/apiClient';
import type { FeedPost } from '../../../core/types/social.types';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { RootStackParamList } from '../../../navigation/types';
import { AppLogo } from '../../../shared/components/AppLogo';
import { SectionHeader } from '../../../shared/components/SectionHeader';
import { StatusPill } from '../../../shared/components/StatusPill';
import { formatMatchDate } from '../../../shared/utils/format';
import { FeedPostCard } from '../components/FeedPostCard';
import { ActionsGrid, BrandRow, Header, HeroKicker, HeroMeta, HeroTitle, IconButton, Kicker, List, NextMatch, Points, PointsCard, PointsCopy, PointsMeta, PointsTitle, QuickAction, QuickLabel, Screen, SectionGap, Title, Welcome } from './HomeScreenStyled';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const { auth, isDemo } = useAuth();
  const feed = useTinballStore((state) => state.feed);
  const nextMatch = useTinballStore((state) => state.matches.find((match) => match.status === 'CONFIRMED'));
  const rewardPoints = useTinballStore((state) => state.rewardPoints);
  const toggleLike = useTinballStore((state) => state.togglePostLike);
  const handleLike = useCallback(async (post: FeedPost) => {
    toggleLike(post.id);
    if (isDemo) return;
    try {
      await apiRequest(`/api/v1/feed/${post.id}/reactions`, post.liked ? { method: 'DELETE' } : { method: 'POST', body: { kind: 'LIKE' } });
    } catch (caught) {
      toggleLike(post.id);
      Alert.alert('No pudimos actualizar la reacción', caught instanceof Error ? caught.message : 'Intentá nuevamente.');
    }
  }, [isDemo, toggleLike]);
  const renderPost = useCallback(({ item }: { item: FeedPost }) => <FeedPostCard post={item} onLike={() => { void handleLike(item); }} />, [handleLike]);

  const header = (
    <Header>
      <BrandRow><AppLogo size={52} /><Welcome><Kicker>Buen día, {auth?.user.displayName.split(' ')[0] ?? 'futbolista'}</Kicker><Title>¿Jugamos?</Title></Welcome><IconButton accessibilityRole="button" accessibilityLabel="Notificaciones" onPress={() => navigation.navigate('Notifications')}><Ionicons name="notifications-outline" size={23} color={theme.colors.text} /></IconButton></BrandRow>
      {nextMatch ? <NextMatch accessibilityRole="button" accessibilityLabel={`Próximo partido ${nextMatch.title}`} onPress={() => navigation.navigate('MatchDetail', { matchId: nextMatch.id })}><BrandRow><HeroKicker>Próximo partido</HeroKicker><StatusPill label="Confirmado" tone="primary" icon="checkmark-circle-outline" /></BrandRow><HeroTitle>{nextMatch.homeTeam} vs. {nextMatch.awayTeam}</HeroTitle><HeroMeta>{formatMatchDate(nextMatch.startsAt)} · {nextMatch.venueName}</HeroMeta></NextMatch> : null}
      <SectionHeader title="Armá tu partido" subtitle="Elegí cómo querés jugar hoy" />
      <ActionsGrid>
        <QuickAction accessibilityRole="button" accessibilityLabel="Buscar un jugador" onPress={() => navigation.navigate('Main', { screen: 'Discover' })}><Ionicons name="person-add-outline" size={25} color={theme.colors.primary} /><QuickLabel>Me falta uno</QuickLabel></QuickAction>
        <QuickAction accessibilityRole="button" accessibilityLabel="Crear un lobby" onPress={() => navigation.navigate('CreateLobby')}><Ionicons name="add-circle-outline" size={25} color={theme.colors.primary} /><QuickLabel>Crear lobby</QuickLabel></QuickAction>
        <QuickAction accessibilityRole="button" accessibilityLabel="Ver torneos" onPress={() => navigation.navigate('Tournaments')}><Ionicons name="trophy-outline" size={25} color={theme.colors.warning} /><QuickLabel>Torneos</QuickLabel></QuickAction>
        <QuickAction accessibilityRole="button" accessibilityLabel="Ver canchas" onPress={() => navigation.navigate('Venues')}><Ionicons name="location-outline" size={25} color={theme.colors.info} /><QuickLabel>Canchas</QuickLabel></QuickAction>
      </ActionsGrid>
      <PointsCard accessibilityRole="button" accessibilityLabel={`${rewardPoints} puntos disponibles`} onPress={() => navigation.navigate('Rewards')}><Points>{rewardPoints}</Points><PointsCopy><PointsTitle>Puntos Tinball</PointsTitle><PointsMeta>Te faltan 820 para tu próxima recompensa.</PointsMeta></PointsCopy><Ionicons name="chevron-forward" size={21} color={theme.colors.textMuted} /></PointsCard>
      <SectionHeader title="La tribuna" subtitle="Resultados, búsquedas y logros de la comunidad" actionLabel="Publicar" onAction={() => navigation.navigate('CreatePost')} />
      <SectionGap />
    </Header>
  );
  return <Screen><List data={feed} keyExtractor={(item) => item.id} renderItem={renderPost} ListHeaderComponent={header} /></Screen>;
}
