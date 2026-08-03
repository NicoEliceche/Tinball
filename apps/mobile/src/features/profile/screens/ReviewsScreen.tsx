import { useRoute, type RouteProp } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { PlayerReview } from '../../../core/types/player.types';
import type { RootStackParamList } from '../../../navigation/types';
import { ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { FootballRating } from '../../../shared/components/FootballRating';
import { StatusPill } from '../../../shared/components/StatusPill';
import { Author, Comment, Header, List, Meta, ReviewCard, Screen } from './ReviewsScreenStyled';

interface ReviewResponse {
  id: string; rating: number; tags: string[]; comment: string; createdAt: string; verifiedAttendance: boolean;
  reviewer: { displayName: string };
  match: { title: string };
}
const tagLabels: Record<string, string> = { PUNCTUAL: 'Puntual', TEAM_PLAYER: 'Compañero', FAIR_PLAY: 'Juego limpio', COMMUNICATIVE: 'Comunicativo', SKILLED: 'Buen nivel' };

export function ReviewsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Reviews'>>();
  const { auth, isDemo } = useAuth();
  const reviews = useTinballStore((state) => state.reviews);
  const setReviews = useTinballStore((state) => state.setReviews);
  const currentProfile = useTinballStore((state) => state.currentProfile);
  const player = useTinballStore((state) => state.players.find((item) => item.id === route.params.playerId));
  const [error, setError] = useState('');

  useEffect(() => {
    if (isDemo) return;
    let active = true;
    apiRequest<{ items: ReviewResponse[] }>(`/api/v1/players/${route.params.playerId}/reviews?limit=50`)
      .then((response) => {
        if (!active) return;
        setReviews(response.items.map((review) => ({ id: review.id, authorName: review.reviewer.displayName, rating: review.rating, tags: review.tags.map((tag) => tagLabels[tag] ?? tag), comment: review.comment, matchLabel: review.match.title, createdAt: review.createdAt, verifiedAttendance: review.verifiedAttendance })));
      })
      .catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : 'No pudimos cargar las valoraciones.'); });
    return () => { active = false; };
  }, [isDemo, route.params.playerId, setReviews]);

  const ownProfile = route.params.playerId === auth?.user.id ? currentProfile : null;
  const rating = ownProfile?.rating ?? player?.rating ?? 0;
  const count = ownProfile?.reviewCount ?? player?.reviewCount ?? reviews.length;
  const renderItem = useCallback(({ item }: { item: PlayerReview }) => <ReviewCard><Author>{item.authorName}</Author><FootballRating value={item.rating} /><Comment>{item.comment || 'Valoración sin comentario.'}</Comment>{item.tags.map((tag) => <StatusPill key={tag} label={tag} tone="primary" />)}<Meta>{item.matchLabel} · Asistencia verificada</Meta></ReviewCard>, []);
  const header = <Header><ScreenTitle>Valoraciones</ScreenTitle><FootballRating value={rating} count={count} /><Meta>{error || 'Sólo pueden valorar quienes compartieron un partido con check-in verificado.'}</Meta></Header>;
  return <Screen><List data={reviews} keyExtractor={(item) => item.id} renderItem={renderItem} ListHeaderComponent={header} /></Screen>;
}
