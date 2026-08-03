import * as Clipboard from 'expo-clipboard';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Share } from 'react-native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { BodyText, Card, CardTitle, Metric, MetricLabel, Metrics, MetricValue, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { ClaimField, ClaimRow, Code, CodeBox, CopyButton, CopyText } from './ReferralsScreenStyled';

interface Referral { status: 'CLICKED' | 'REGISTERED' | 'VERIFIED_MATCH' | 'REWARDED' | 'REJECTED'; pointsAwarded: number }
interface ReferralCode { id: string; code: string; active: boolean; referrals: Referral[] }
const demoCodes: ReferralCode[] = [{ id: 'demo-code', code: 'NICO-JUEGA', active: true, referrals: [{ status: 'REWARDED', pointsAwarded: 200 }, { status: 'REWARDED', pointsAwarded: 200 }, { status: 'VERIFIED_MATCH', pointsAwarded: 200 }, { status: 'REGISTERED', pointsAwarded: 0 }, { status: 'REGISTERED', pointsAwarded: 0 }, { status: 'REGISTERED', pointsAwarded: 0 }, { status: 'REGISTERED', pointsAwarded: 0 }] }];

export function ReferralsScreen() {
  const { isDemo } = useAuth();
  const [codes, setCodes] = useState<ReferralCode[]>(isDemo ? demoCodes : []);
  const [claimCode, setClaimCode] = useState('');
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (isDemo) return;
    let active = true;
    apiRequest<{ codes: ReferralCode[] }>('/api/v1/referrals/me')
      .then(async (response) => {
        if (!active) return;
        if (response.codes.some((item) => item.active)) { setCodes(response.codes); return; }
        const created = await apiRequest<Omit<ReferralCode, 'referrals'>>('/api/v1/referrals/code', { method: 'POST' });
        if (active) setCodes([{ ...created, referrals: [] }, ...response.codes]);
      })
      .catch((caught: unknown) => { if (active) Alert.alert('No pudimos cargar tus referidos', caught instanceof Error ? caught.message : 'Intentá nuevamente.'); });
    return () => { active = false; };
  }, [isDemo]);
  const activeCode = codes.find((item) => item.active)?.code ?? 'GENERANDO';
  const metrics = useMemo(() => {
    const referrals = codes.flatMap((item) => item.referrals);
    return { invited: referrals.length, activated: referrals.filter((item) => item.status === 'VERIFIED_MATCH' || item.status === 'REWARDED').length, points: referrals.reduce((total, item) => total + item.pointsAwarded, 0) };
  }, [codes]);

  const claim = async () => {
    if (claimCode.trim().length < 4) return;
    setClaiming(true);
    try {
      if (!isDemo) await apiRequest('/api/v1/referrals/claim', { method: 'POST', body: { code: claimCode.trim().toUpperCase() } });
      setClaimCode('');
      Alert.alert('Código aplicado', 'La recompensa se habilitará al completar el primer partido verificado.');
    } catch (caught) {
      Alert.alert('No pudimos aplicar el código', caught instanceof Error ? caught.message : 'Revisalo e intentá nuevamente.');
    } finally {
      setClaiming(false);
    }
  };

  return <ScrollScreen>
    <ScreenTitle>Invitar amigos</ScreenTitle><BodyText>Sumá jugadores confiables a tu comunidad y recibí puntos cuando completen su primer partido verificado.</BodyText>
    <CodeBox><BodyText>Tu código</BodyText><Code>{activeCode}</Code><CopyButton onPress={() => { void Clipboard.setStringAsync(activeCode).then(() => Alert.alert('Código copiado', activeCode)); }}><CopyText>Copiar código</CopyText></CopyButton></CodeBox>
    <PrimaryButton label="Compartir invitación" icon="share-social-outline" onPress={() => { void Share.share({ message: `Sumate a Tinball con mi código ${activeCode}` }); }} />
    <Metrics><Metric><MetricValue>{metrics.invited}</MetricValue><MetricLabel>Invitados</MetricLabel></Metric><Metric><MetricValue>{metrics.activated}</MetricValue><MetricLabel>Activados</MetricLabel></Metric><Metric><MetricValue>{metrics.points}</MetricValue><MetricLabel>Puntos ganados</MetricLabel></Metric></Metrics>
    <Card><CardTitle>¿Te invitó alguien?</CardTitle><ClaimRow><ClaimField value={claimCode} onChangeText={setClaimCode} maxLength={32} placeholder="CÓDIGO" accessibilityLabel="Código de referido recibido" /></ClaimRow><PrimaryButton label="Aplicar código" icon="ticket-outline" variant="secondary" loading={claiming} disabled={claiming || claimCode.trim().length < 4} onPress={() => { void claim(); }} /></Card>
    <Card><CardTitle>Cómo funciona</CardTitle><BodyText>1. Tu amigo se registra con el código. 2. Completa identidad y su primer partido. 3. Ambos reciben puntos.</BodyText></Card>
    <Card><CardTitle>Pagos por campaña</CardTitle><BodyText>Los pagos en dinero están desactivados hasta implementar identidad, atribución antifraude, límites e impuestos. Los puntos y beneficios de sponsors sí pueden habilitarse antes.</BodyText></Card>
  </ScrollScreen>;
}
