import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useState } from 'react';
import { Alert } from 'react-native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { RootStackParamList } from '../../../navigation/types';
import { Avatar } from '../../../shared/components/Avatar';
import { BodyText, CardTitle, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { FootballRating } from '../../../shared/components/FootballRating';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { Center, Comment, Tag, Tags, TagText } from './ReviewPlayerScreenStyled';

const availableTags = ['Puntual', 'Compañero', 'Juego limpio', 'Comunicativo', 'Buen nivel'] as const;
const tagValues = { Puntual: 'PUNCTUAL', Compañero: 'TEAM_PLAYER', 'Juego limpio': 'FAIR_PLAY', Comunicativo: 'COMMUNICATIVE', 'Buen nivel': 'SKILLED' } as const;

export function ReviewPlayerScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ReviewPlayer'>>();
  const navigation = useNavigation();
  const { auth, isDemo } = useAuth();
  const player = useTinballStore((state) => state.players.find((item) => item.id === route.params.playerId));
  const matchPlayer = useTinballStore((state) => state.matches.find((match) => match.id === route.params.matchId)?.players.find((item) => item.id === route.params.playerId));
  const submit = useTinballStore((state) => state.submitReview);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const subject = player ?? matchPlayer;
  if (!subject) return <ScrollScreen><ScreenTitle>Jugador no encontrado</ScreenTitle></ScrollScreen>;

  const save = async () => {
    if (rating < 1) {
      Alert.alert('Elegí una valoración', 'Marcá de 1 a 5 balones.');
      return;
    }
    setSaving(true);
    try {
      if (!isDemo) await apiRequest('/api/v1/reviews', { method: 'POST', body: { reviewedUserId: subject.id, matchId: route.params.matchId, rating, tags: tags.map((tag) => tagValues[tag as keyof typeof tagValues]), comment } });
      submit({ authorName: auth?.user.displayName ?? 'Jugador', rating, tags, comment, matchLabel: 'Partido verificado' });
      Alert.alert('Valoración guardada', 'Se publicará cuando la otra persona valore o pasen 72 horas.', [{ text: 'Listo', onPress: () => navigation.goBack() }]);
    } catch (caught) {
      Alert.alert('No pudimos guardar la valoración', caught instanceof Error ? caught.message : 'Intentá nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return <ScrollScreen>
    <Center><Avatar uri={subject.avatarUrl} name={subject.displayName} size={92} /><CardTitle>{subject.displayName}</CardTitle><BodyText>Valorá sólo lo ocurrido en el partido.</BodyText><FootballRating value={rating} interactive onChange={setRating} /></Center>
    <CardTitle>¿Qué destacó?</CardTitle>
    <Tags>{availableTags.map((tag) => <Tag key={tag} $selected={tags.includes(tag)} onPress={() => setTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])}><TagText $selected={tags.includes(tag)}>{tag}</TagText></Tag>)}</Tags>
    <CardTitle>Comentario opcional</CardTitle>
    <Comment value={comment} onChangeText={setComment} maxLength={500} placeholder="Sé concreto, respetuoso y útil para futuros equipos." accessibilityLabel="Comentario de la valoración" />
    <BodyText>Las valoraciones falsas, discriminatorias o de represalia pueden moderarse y apelarse.</BodyText>
    <PrimaryButton label="Enviar valoración" icon="football-outline" loading={saving} disabled={saving} onPress={() => { void save(); }} />
  </ScrollScreen>;
}
