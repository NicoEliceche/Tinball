import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert } from 'react-native';
import { useState } from 'react';
import { useTheme } from 'styled-components/native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { BodyText, Card, CardTitle, Row, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { StatusPill } from '../../../shared/components/StatusPill';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { Benefits, Center, PremiumHero, Price } from './PremiumScreenStyled';
export function PremiumScreen() {
  const theme = useTheme();
  const { isDemo } = useAuth();
  const [saving, setSaving] = useState(false);
  const benefits = ['Sin anuncios', 'Lobbies Premium con identidad y compromiso reforzados', '1,5× puntos canjeables por partido', 'Filtros avanzados y estadísticas extendidas', 'Soporte prioritario'];
  const registerInterest = async () => {
    setSaving(true);
    try {
      if (!isDemo) await apiRequest('/api/v1/premium/interest', { method: 'POST' });
      Alert.alert('Aviso activado', isDemo ? 'En una cuenta real, esta preferencia queda guardada en Tinball.' : 'Guardamos tu interés. Te notificaremos cuando Premium se pueda contratar.');
    } catch (caught) { Alert.alert('No pudimos guardar el aviso', caught instanceof Error ? caught.message : 'Intentá nuevamente.'); }
    finally { setSaving(false); }
  };
  return <ScrollScreen><PremiumHero><StatusPill label="Tinball Premium" tone="warning" icon="diamond-outline" /><ScreenTitle>Jugá más. Organizá mejor.</ScreenTitle><Price>$ — / mes</Price><Center>El precio se mostrará desde App Store/Google Play cuando las compras estén habilitadas.</Center></PremiumHero><Benefits>{benefits.map((benefit) => <Card key={benefit}><Row><Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} /><BodyText>{benefit}</BodyText></Row></Card>)}</Benefits><Card><CardTitle>Competencia justa</CardTitle><BodyText>Premium no aumenta Tinball Rank, no oculta derrotas y no reduce sanciones. La reputación deportiva no se compra.</BodyText></Card><PrimaryButton label="Avisarme cuando esté disponible" icon="notifications-outline" loading={saving} disabled={saving} onPress={() => { void registerInterest(); }} /></ScrollScreen>;
}
