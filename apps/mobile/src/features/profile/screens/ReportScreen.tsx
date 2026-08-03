import { CreateReportSchema } from '@tinball/contracts';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useState } from 'react';
import { Alert } from 'react-native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import type { RootStackParamList } from '../../../navigation/types';
import { BodyText, Card, CardTitle, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { Detail, ErrorText, Option, Options, OptionText } from './ReportScreenStyled';

const categories = [
  { value: 'HARASSMENT', label: 'Acoso' }, { value: 'DISCRIMINATION', label: 'Discriminación' },
  { value: 'THREAT', label: 'Amenaza' }, { value: 'FRAUD', label: 'Fraude' },
  { value: 'NO_SHOW', label: 'Ausencia' }, { value: 'FAKE_RESULT', label: 'Resultado falso' },
  { value: 'UNSAFE_CONDUCT', label: 'Conducta peligrosa' }, { value: 'SPAM', label: 'Spam' },
  { value: 'OTHER', label: 'Otro' },
] as const;

export function ReportScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Report'>>();
  const navigation = useNavigation();
  const { isDemo } = useAuth();
  const [category, setCategory] = useState<(typeof categories)[number]['value']>('OTHER');
  const [detail, setDetail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    const parsed = CreateReportSchema.safeParse({ ...route.params, category, detail: detail.trim() });
    if (!parsed.success) {
      setError('Describí lo ocurrido con al menos 10 caracteres para que podamos investigarlo.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (!isDemo) await apiRequest('/api/v1/reports', { method: 'POST', body: parsed.data });
      Alert.alert('Reporte recibido', 'Guardamos el caso y el equipo de seguridad podrá revisarlo sin avisar a la persona reportada.', [{ text: 'Listo', onPress: () => navigation.goBack() }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos enviar el reporte.');
    } finally {
      setSaving(false);
    }
  };

  return <ScrollScreen>
    <ScreenTitle>Reportar un problema</ScreenTitle>
    <BodyText>Los reportes son confidenciales. Si existe peligro inmediato, contactá a emergencias antes de usar la app.</BodyText>
    <Card><CardTitle>¿Qué ocurrió?</CardTitle><Options>{categories.map((item) => <Option key={item.value} $selected={category === item.value} onPress={() => setCategory(item.value)}><OptionText $selected={category === item.value}>{item.label}</OptionText></Option>)}</Options></Card>
    <Detail value={detail} onChangeText={setDetail} maxLength={2000} textAlignVertical="top" placeholder="Contanos qué pasó, cuándo y cualquier dato útil." accessibilityLabel="Detalle del reporte" />
    {error ? <ErrorText accessibilityLiveRegion="polite">{error}</ErrorText> : null}
    <PrimaryButton label="Enviar reporte" icon="shield-checkmark-outline" variant="danger" loading={saving} disabled={saving} onPress={() => { void send(); }} />
  </ScrollScreen>;
}
