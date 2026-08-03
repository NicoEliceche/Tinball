import { MatchResultSchema } from '@tinball/contracts';
import * as Crypto from 'expo-crypto';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useState } from 'react';
import { Alert } from 'react-native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { Match } from '../../../core/types/match.types';
import type { RootStackParamList } from '../../../navigation/types';
import { BodyText, Card, CardTitle, MetaText, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { ErrorCopy, ScoreField, ScoreRow, TeamColumn, TeamName, Versus } from './SubmitResultScreenStyled';

interface ResultResponse {
  homeScore: number | null;
  awayScore: number | null;
  resultStatus: NonNullable<Match['resultStatus']>;
}

export function SubmitResultScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'SubmitResult'>>();
  const navigation = useNavigation();
  const { isDemo } = useAuth();
  const match = useTinballStore((state) => state.matches.find((item) => item.id === route.params.matchId));
  const setMatchResult = useTinballStore((state) => state.setMatchResult);
  const [homeScore, setHomeScore] = useState(match?.homeScore?.toString() ?? '');
  const [awayScore, setAwayScore] = useState(match?.awayScore?.toString() ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!match) return <ScrollScreen><ScreenTitle>Partido no encontrado</ScreenTitle></ScrollScreen>;

  const submit = async () => {
    const parsed = MatchResultSchema.safeParse({
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      idempotencyKey: Crypto.randomUUID(),
    });
    if (!parsed.success || homeScore.trim() === '' || awayScore.trim() === '') {
      setError('Ingresá un resultado válido entre 0 y 99 para ambos equipos.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const result = isDemo
        ? { homeScore: parsed.data.homeScore, awayScore: parsed.data.awayScore, resultStatus: 'CONFIRMED' as const }
        : await apiRequest<ResultResponse>(`/api/v1/matches/${match.id}/result`, { method: 'POST', body: parsed.data });
      if (result.homeScore === null || result.awayScore === null) throw new Error('El servidor no devolvió un resultado válido.');
      setMatchResult(match.id, result.homeScore, result.awayScore, result.resultStatus);

      const disputed = result.resultStatus === 'DISPUTED';
      const confirmed = result.resultStatus === 'CONFIRMED';
      Alert.alert(
        disputed ? 'Resultado en revisión' : confirmed ? 'Resultado confirmado' : 'Resultado enviado',
        disputed
          ? 'El otro equipo informó un marcador distinto. Tinball lo dejó en disputa para revisión.'
          : confirmed
            ? 'Ambos lados informaron el mismo marcador. El resultado quedó verificado.'
            : 'Falta que el otro lado confirme el mismo marcador para que quede verificado.',
        [{ text: 'Listo', onPress: () => navigation.goBack() }],
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos enviar el resultado.');
    } finally {
      setSaving(false);
    }
  };

  return <ScrollScreen>
    <ScreenTitle>Cargar resultado</ScreenTitle>
    <BodyText>El marcador sólo se confirma cuando los responsables de ambos lados informan lo mismo.</BodyText>
    <Card>
      <ScoreRow>
        <TeamColumn><TeamName numberOfLines={2}>{match.homeTeam}</TeamName><ScoreField value={homeScore} onChangeText={(value) => setHomeScore(value.replace(/\D/g, '').slice(0, 2))} keyboardType="number-pad" maxLength={2} placeholder="0" accessibilityLabel={`Goles de ${match.homeTeam}`} /></TeamColumn>
        <Versus>—</Versus>
        <TeamColumn><TeamName numberOfLines={2}>{match.awayTeam}</TeamName><ScoreField value={awayScore} onChangeText={(value) => setAwayScore(value.replace(/\D/g, '').slice(0, 2))} keyboardType="number-pad" maxLength={2} placeholder="0" accessibilityLabel={`Goles de ${match.awayTeam}`} /></TeamColumn>
      </ScoreRow>
    </Card>
    {error ? <ErrorCopy accessibilityRole="alert">{error}</ErrorCopy> : null}
    <Card><CardTitle>Confirmación protegida</CardTitle><MetaText>Cada envío usa una clave única para evitar duplicados. Si los marcadores no coinciden, el partido pasa a disputa y no modifica el ranking hasta su resolución.</MetaText></Card>
    <PrimaryButton label="Enviar marcador" icon="checkmark-circle-outline" loading={saving} disabled={saving} onPress={() => { void submit(); }} />
  </ScrollScreen>;
}
