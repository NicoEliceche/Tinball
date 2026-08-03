import { CreatePostSchema } from '@tinball/contracts';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert } from 'react-native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { FeedPost } from '../../../core/types/social.types';
import { BodyText, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { ErrorText, Group, Helper, Label, MatchOption, MatchText, Option, Options, OptionText, PostField } from './CreatePostScreenStyled';

const kinds: { value: FeedPost['kind']; label: string }[] = [
  { value: 'GENERAL', label: 'General' },
  { value: 'LOOKING_FOR_PLAYERS', label: 'Busco jugadores' },
  { value: 'ACHIEVEMENT', label: 'Logro' },
  { value: 'RESULT', label: 'Resultado' },
];

export function CreatePostScreen() {
  const navigation = useNavigation();
  const { auth, isDemo } = useAuth();
  const matches = useTinballStore((state) => state.matches.filter((match) => match.status === 'COMPLETED'));
  const addFeedPost = useTinballStore((state) => state.addFeedPost);
  const [kind, setKind] = useState<FeedPost['kind']>('GENERAL');
  const [body, setBody] = useState('');
  const [matchId, setMatchId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const publish = async () => {
    const parsed = CreatePostSchema.safeParse({ body: body.trim(), kind, matchId: kind === 'RESULT' ? matchId : undefined });
    if (!parsed.success || (kind === 'RESULT' && !matchId)) {
      setError(kind === 'RESULT' ? 'Elegí un partido con resultado confirmado.' : 'Escribí algo antes de publicar.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = isDemo ? { id: `post-${Date.now()}`, createdAt: new Date().toISOString() } : await apiRequest<{ id: string; createdAt: string }>('/api/v1/feed', { method: 'POST', body: parsed.data });
      const match = matches.find((item) => item.id === matchId);
      addFeedPost({ id: response.id, authorName: auth?.user.displayName ?? 'Jugador', authorAvatar: auth?.user.avatarUrl ?? '', body: parsed.data.body, kind: parsed.data.kind, createdAt: response.createdAt, likes: 0, comments: 0, liked: false, ...(match ? { matchScore: `${match.homeScore ?? 0} — ${match.awayScore ?? 0}`, matchLabel: `${match.homeTeam} vs. ${match.awayTeam} · Resultado verificado` } : {}) });
      Alert.alert('Publicación enviada', isDemo ? 'Ya aparece en La tribuna.' : 'La vas a ver de inmediato; en producción puede quedar en revisión breve antes de mostrarse al resto.', [{ text: 'Listo', onPress: () => navigation.goBack() }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos publicar.');
    } finally {
      setSaving(false);
    }
  };

  return <ScrollScreen>
    <ScreenTitle>Publicar en La tribuna</ScreenTitle>
    <BodyText>Compartí una búsqueda, un logro o un resultado real con la comunidad.</BodyText>
    <Group><Label>Tipo</Label><Options>{kinds.map((item) => <Option key={item.value} $selected={kind === item.value} onPress={() => { setKind(item.value); if (item.value !== 'RESULT') setMatchId(undefined); }}><OptionText $selected={kind === item.value}>{item.label}</OptionText></Option>)}</Options></Group>
    {kind === 'RESULT' ? <Group><Label>Partido verificado</Label>{matches.length > 0 ? matches.map((match) => <MatchOption key={match.id} $selected={matchId === match.id} onPress={() => setMatchId(match.id)}><MatchText>{match.homeTeam} {match.homeScore ?? '—'} · {match.awayScore ?? '—'} {match.awayTeam}</MatchText></MatchOption>) : <Helper>No tenés resultados confirmados disponibles para publicar.</Helper>}</Group> : null}
    <Group><Label>Mensaje</Label><PostField value={body} onChangeText={setBody} maxLength={1000} textAlignVertical="top" placeholder="Contale a la comunidad…" accessibilityLabel="Contenido de la publicación" /><Helper>{body.length}/1000</Helper></Group>
    {error ? <ErrorText accessibilityLiveRegion="polite">{error}</ErrorText> : null}
    <PrimaryButton label="Publicar" icon="send-outline" loading={saving} disabled={saving} onPress={() => { void publish(); }} />
  </ScrollScreen>;
}
