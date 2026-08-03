import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import { ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { formatShortDate } from '../../../shared/utils/format';
import type { AppNotification } from '../types/notification.types';
import { Body, Card, Header, InviteActions, InviteButton, InviteText, List, Screen, Time, Title } from './NotificationsScreenStyled';

const demoNotifications: AppNotification[] = [
  { id: 'n1', title: 'Confirmá el martes', body: 'Los del Parque vs. Barrio Norte comienza en 48 horas.', createdAt: '2026-08-02T10:00:00-03:00', read: false, kind: 'MATCH' },
  { id: 'n2', title: 'Mateo aceptó tu invitación', body: 'Ya puede sumarse al lobby Falta arquero para hoy.', createdAt: '2026-08-01T21:00:00-03:00', read: false, kind: 'INVITE' },
  { id: 'n3', title: 'Sumaste 180 puntos', body: 'Partido y valoración verificados.', createdAt: '2026-07-31T09:00:00-03:00', read: true, kind: 'REWARD' },
];
interface NotificationResponse { id: string; title: string; body: string; category: string; createdAt: string; readAt: string | null }
interface InviteResponse { id: string; sender: { displayName: string }; lobby: { title: string } | null; team: { name: string } | null }
const notificationKind = (category: string): AppNotification['kind'] => category === 'MATCH' ? 'MATCH' : category === 'INVITE' ? 'INVITE' : category === 'REWARD' ? 'REWARD' : 'SECURITY';

export function NotificationsScreen() {
  const { isDemo } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>(isDemo ? demoNotifications : []);
  const [invites, setInvites] = useState<InviteResponse[]>([]);
  const clearData = useTinballStore((state) => state.clearData);
  useEffect(() => {
    if (isDemo) return;
    let active = true;
    apiRequest<{ items: NotificationResponse[] }>('/api/v1/notifications?limit=50')
      .then(async (response) => {
        if (!active) return;
        const mapped = response.items.map((item) => ({ id: item.id, title: item.title, body: item.body, createdAt: item.createdAt, read: Boolean(item.readAt), kind: notificationKind(item.category) }));
        setNotifications(mapped);
        const unread = mapped.filter((item) => !item.read).map((item) => item.id);
        if (unread.length > 0) {
          await apiRequest('/api/v1/notifications/read', { method: 'POST', body: { notificationIds: unread } });
          if (active) setNotifications((current) => current.map((item) => ({ ...item, read: true })));
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [isDemo]);
  useEffect(() => {
    if (isDemo) return;
    let active = true;
    apiRequest<{ items: InviteResponse[] }>('/api/v1/invites').then((response) => { if (active) setInvites(response.items); }).catch(() => undefined);
    return () => { active = false; };
  }, [isDemo]);
  const respondInvite = async (inviteId: string, decision: 'ACCEPTED' | 'DECLINED') => {
    try {
      await apiRequest(`/api/v1/invites/${inviteId}/respond`, { method: 'POST', body: { decision } });
      setInvites((current) => current.filter((invite) => invite.id !== inviteId));
      if (decision === 'ACCEPTED') clearData();
    } catch (caught) {
      Alert.alert('No pudimos responder', caught instanceof Error ? caught.message : 'La invitación sigue disponible para reintentar.');
    }
  };
  const render = useCallback(({ item }: { item: AppNotification }) => <Card $read={item.read}><Title>{item.title}</Title><Body>{item.body}</Body><Time>{formatShortDate(item.createdAt)}</Time></Card>, []);
  return <Screen><List data={notifications} keyExtractor={(item) => item.id} renderItem={render} ListHeaderComponent={<Header><ScreenTitle>Notificaciones</ScreenTitle>{invites.map((invite) => <Card key={invite.id} $read={false}><Title>Invitación de {invite.sender.displayName}</Title><Body>{invite.team ? `Sumarte a ${invite.team.name}` : invite.lobby ? `Jugar en ${invite.lobby.title}` : 'Conectar como jugadores'}</Body><InviteActions><InviteButton $accept onPress={() => { void respondInvite(invite.id, 'ACCEPTED'); }}><InviteText $accept>Aceptar</InviteText></InviteButton><InviteButton onPress={() => { void respondInvite(invite.id, 'DECLINED'); }}><InviteText>Rechazar</InviteText></InviteButton></InviteActions></Card>)}</Header>} /></Screen>;
}
