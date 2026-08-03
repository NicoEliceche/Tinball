import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { Avatar } from '../../../shared/components/Avatar';
import { BodyText, Card, CardTitle, Flexible, Row, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { positionLabels } from '../../../shared/utils/format';
import type { Position } from '@tinball/contracts';

interface BlockedPlayer { id: string; createdAt: string; user: { id: string; displayName: string; avatarUrl: string | null; profile: { locality: string; primaryPosition: Position } | null } }

export function BlockedPlayersScreen() {
  const { isDemo } = useAuth();
  const [items, setItems] = useState<BlockedPlayer[]>([]);
  const [loading, setLoading] = useState(!isDemo);
  useEffect(() => {
    if (isDemo) return;
    let active = true;
    apiRequest<{ items: BlockedPlayer[] }>('/api/v1/blocks').then((response) => { if (active) setItems(response.items); }).catch((caught: unknown) => { if (active) Alert.alert('No pudimos cargar los bloqueos', caught instanceof Error ? caught.message : 'Intentá nuevamente.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isDemo]);
  const unblock = async (item: BlockedPlayer) => {
    try {
      if (!isDemo) await apiRequest(`/api/v1/players/${item.user.id}/block`, { method: 'DELETE' });
      setItems((current) => current.filter((block) => block.id !== item.id));
    } catch (caught) { Alert.alert('No pudimos desbloquear', caught instanceof Error ? caught.message : 'Intentá nuevamente.'); }
  };
  return <ScrollScreen><ScreenTitle>Jugadores bloqueados</ScreenTitle><BodyText>No pueden descubrirse, invitarse ni verse en el feed. Desbloquear no restaura invitaciones anteriores.</BodyText>{loading ? <BodyText>Cargando…</BodyText> : items.length === 0 ? <Card><CardTitle>No bloqueaste a nadie</CardTitle><BodyText>Si bloqueás un perfil, aparecerá acá.</BodyText></Card> : items.map((item) => <Card key={item.id}><Row><Avatar uri={item.user.avatarUrl ?? ''} name={item.user.displayName} size={46} /><Flexible><CardTitle>{item.user.displayName}</CardTitle><BodyText>{item.user.profile ? `${positionLabels[item.user.profile.primaryPosition]} · ${item.user.profile.locality}` : 'Perfil no disponible'}</BodyText></Flexible></Row><PrimaryButton label="Desbloquear" icon="lock-open-outline" variant="secondary" onPress={() => { void unblock(item); }} /></Card>)}</ScrollScreen>;
}
