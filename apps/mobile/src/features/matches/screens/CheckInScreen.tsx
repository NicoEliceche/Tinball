import { MatchCheckInSchema } from '@tinball/contracts';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useState } from 'react';
import { Alert } from 'react-native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { RootStackParamList } from '../../../navigation/types';
import { BodyText, Card, CardTitle, MetaText, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { Code, CodeField, ErrorCopy } from './CheckInScreenStyled';

interface GeneratedCode { code: string; validUntil: string }

export function CheckInScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'MatchCheckIn'>>();
  const navigation = useNavigation();
  const { auth, isDemo } = useAuth();
  const match = useTinballStore((state) => state.matches.find((item) => item.id === route.params.matchId));
  const markCheckedIn = useTinballStore((state) => state.checkInMatchParticipation);
  const [code, setCode] = useState('');
  const [organizerCode, setOrganizerCode] = useState<GeneratedCode | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  if (!match) return <ScrollScreen><ScreenTitle>Partido no encontrado</ScreenTitle></ScrollScreen>;

  const checkIn = async () => {
    const parsed = MatchCheckInSchema.safeParse({ code });
    if (!parsed.success) { setError('El código debe tener exactamente 6 números.'); return; }
    setError(''); setSaving(true);
    try {
      if (isDemo) {
        if (parsed.data.code !== '482731') throw new Error('En el modo demo usá el código 482731.');
      } else {
        await apiRequest(`/api/v1/matches/${match.id}/check-in`, { method: 'POST', body: parsed.data });
      }
      if (auth?.user.id) markCheckedIn(match.id, auth.user.id);
      Alert.alert('Asistencia verificada', 'Tu check-in quedó registrado sin guardar coordenadas precisas.', [{ text: 'Listo', onPress: () => navigation.goBack() }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos validar el código.');
    } finally { setSaving(false); }
  };

  const generate = async () => {
    setError(''); setGenerating(true);
    try {
      const response = isDemo
        ? { code: '482731', validUntil: new Date(Date.now() + 45 * 60 * 1000).toISOString() }
        : await apiRequest<GeneratedCode>(`/api/v1/matches/${match.id}/check-in-code`, { method: 'POST' });
      setOrganizerCode(response);
      setCode(response.code);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Sólo la organización puede generar el código.');
    } finally { setGenerating(false); }
  };

  return <ScrollScreen>
    <ScreenTitle>Confirmá que llegaste</ScreenTitle>
    <BodyText>Pedile el código de 6 dígitos a quien organiza {match.title}. Está disponible desde una hora antes y hasta 45 minutos después del inicio.</BodyText>
    <CodeField value={code} onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" maxLength={6} placeholder="000000" accessibilityLabel="Código de check-in" />
    {error ? <ErrorCopy accessibilityRole="alert">{error}</ErrorCopy> : null}
    <PrimaryButton label="Validar asistencia" icon="shield-checkmark-outline" loading={saving} disabled={saving || code.length !== 6} onPress={() => { void checkIn(); }} />
    <Card><CardTitle>¿Organizás el partido?</CardTitle><MetaText>Generá o rotá el código y mostralo sólo a quienes están físicamente en la cancha.</MetaText>{organizerCode ? <><Code selectable>{organizerCode.code}</Code><MetaText>Válido hasta {new Date(organizerCode.validUntil).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}.</MetaText></> : null}<PrimaryButton label={organizerCode ? 'Rotar código' : 'Generar código'} icon="key-outline" variant="secondary" loading={generating} disabled={generating} onPress={() => { void generate(); }} /></Card>
  </ScrollScreen>;
}
