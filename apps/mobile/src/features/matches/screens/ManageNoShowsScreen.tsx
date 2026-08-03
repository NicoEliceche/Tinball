import { RecordNoShowSchema } from '@tinball/contracts';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useState } from 'react';
import { Alert } from 'react-native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { RootStackParamList } from '../../../navigation/types';
import { Avatar } from '../../../shared/components/Avatar';
import { BodyText, Card, CardTitle, Flexible, Row, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { ErrorCopy, ReasonField } from './ManageNoShowsScreenStyled';

export function ManageNoShowsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ManageNoShows'>>();
  const { auth, isDemo } = useAuth();
  const match = useTinballStore((state) => state.matches.find((item) => item.id === route.params.matchId));
  const markNoShow = useTinballStore((state) => state.markNoShow);
  const [reason, setReason] = useState('No realizó el check-in y no se presentó al partido.');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  if (!match) return <ScrollScreen><ScreenTitle>Partido no encontrado</ScreenTitle></ScrollScreen>;
  const candidates = match.players.filter((player) => player.id !== auth?.user.id && player.status === 'CONFIRMED' && !player.checkedIn);

  const record = (userId: string, displayName: string) => {
    const parsed = RecordNoShowSchema.safeParse({ reason });
    if (!parsed.success) { setError('Explicá el motivo en al menos 3 caracteres.'); return; }
    Alert.alert('Confirmar ausencia', `Esta acción afecta la confiabilidad de ${displayName} y puede generar una suspensión por reincidencia.`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Registrar', style: 'destructive', onPress: () => {
      void (async () => {
        setSavingId(userId); setError('');
        try {
          if (!isDemo) await apiRequest(`/api/v1/matches/${match.id}/no-shows/${userId}`, { method: 'POST', body: parsed.data });
          markNoShow(match.id, userId);
        } catch (caught) { setError(caught instanceof Error ? caught.message : 'No pudimos registrar la ausencia.'); }
        finally { setSavingId(null); }
      })();
    } }]);
  };

  return <ScrollScreen>
    <ScreenTitle>Gestionar ausencias</ScreenTitle>
    <BodyText>Sólo registrá a personas confirmadas que no hicieron check-in y realmente faltaron. Cada evento queda auditado y puede apelarse.</BodyText>
    <ReasonField value={reason} onChangeText={setReason} maxLength={500} accessibilityLabel="Motivo de la ausencia" />
    {error ? <ErrorCopy accessibilityRole="alert">{error}</ErrorCopy> : null}
    {candidates.length === 0 ? <Card><CardTitle>Sin ausencias pendientes</CardTitle><BodyText>Todos hicieron check-in o ya fueron gestionados.</BodyText></Card> : candidates.map((player) => <Card key={player.id}><Row><Avatar uri={player.avatarUrl} name={player.displayName} size={46} /><Flexible><CardTitle>{player.displayName}</CardTitle><BodyText>Confirmado · sin check-in</BodyText></Flexible></Row><PrimaryButton label="Registrar ausencia" icon="person-remove-outline" variant="danger" loading={savingId === player.id} disabled={savingId !== null} onPress={() => record(player.id, player.displayName)} /></Card>)}
  </ScrollScreen>;
}
