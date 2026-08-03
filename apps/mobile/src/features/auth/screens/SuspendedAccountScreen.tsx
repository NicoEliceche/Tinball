import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { deleteAccount, exportAccountData } from '../../../core/data/services/accountService';
import { useAuth } from '../../../core/providers/AuthProvider';
import { AppLogo } from '../../../shared/components/AppLogo';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { AppealInput, Content, Copy, Eyebrow, Message, Screen, Title } from './SuspendedAccountScreenStyled';
import { useGoogleSignIn } from '../services/useGoogleSignIn';

interface SuspensionSummary { items: { id: string; reason: string; endsAt: string | null; status: 'ACTIVE' | 'APPEALED' }[]; }

export function SuspendedAccountScreen() {
  const { logout } = useAuth();
  const google = useGoogleSignIn();
  const [suspension, setSuspension] = useState<SuspensionSummary['items'][number] | null>(null);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { apiRequest<SuspensionSummary>('/api/v1/suspensions/me', { method: 'GET' }).then((data) => setSuspension(data.items[0] ?? null)).catch(() => setError('No pudimos cargar el detalle de la suspensión.')); }, []);

  const appeal = async () => {
    if (!suspension || reason.trim().length < 10) return;
    setLoading(true); setError(''); setMessage('');
    try {
      await apiRequest(`/api/v1/suspensions/${suspension.id}/appeal`, { method: 'POST', body: { reason: reason.trim() } });
      setMessage('Recibimos tu apelación. El equipo de moderación la revisará.');
      setSuspension({ ...suspension, status: 'APPEALED' });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos enviar la apelación.');
    } finally { setLoading(false); }
  };

  const confirmDelete = () => Alert.alert('Eliminar cuenta definitivamente', 'La suspensión no limita tu derecho a eliminar la cuenta. Esta acción no se puede deshacer.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => { void (async () => { try { const idToken = await google.signIn(); if (!idToken) return; await deleteAccount(idToken); await logout(); } catch (caught) { setError(caught instanceof Error ? caught.message : 'No pudimos eliminar la cuenta.'); } })(); } }]);

  return <Screen><Content>
    <AppLogo size={128} />
    <Eyebrow>Cuenta temporalmente limitada</Eyebrow>
    <Title>Tu lugar en la cancha está en revisión</Title>
    <Copy>{suspension?.reason ?? 'Detectamos una sanción activa en tu cuenta.'} {suspension?.endsAt ? `Finaliza el ${new Date(suspension.endsAt).toLocaleString('es-AR')}.` : ''}</Copy>
    {suspension?.status !== 'APPEALED' ? <>
      <AppealInput value={reason} maxLength={1000} onChangeText={setReason} placeholder="Contanos qué ocurrió (mínimo 10 caracteres)" accessibilityLabel="Motivo de apelación" />
      <PrimaryButton label="Enviar apelación" icon="shield-checkmark-outline" loading={loading} disabled={reason.trim().length < 10 || loading} onPress={appeal} />
    </> : null}
    {message ? <Message>{message}</Message> : null}{error ? <Message $error>{error}</Message> : null}
    <PrimaryButton label="Descargar mis datos" variant="secondary" icon="download-outline" onPress={() => { void exportAccountData().catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'No pudimos exportar tus datos.')); }} />
    <PrimaryButton label="Eliminar mi cuenta" variant="danger" icon="trash-outline" disabled={!google.ready} onPress={confirmDelete} />
    <PrimaryButton label="Cerrar sesión" variant="secondary" icon="log-out-outline" onPress={() => void logout()} />
  </Content></Screen>;
}
