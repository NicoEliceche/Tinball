import { randomUUID } from 'expo-crypto';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { Reward } from '../../../core/types/ranking.types';
import { BodyText, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { StatusPill } from '../../../shared/components/StatusPill';
import { Balance, BalanceValue, Card, Header, List, Name, Price, Screen, Sponsor } from './RewardsScreenStyled';

export function RewardsScreen() {
  const { isDemo } = useAuth();
  const rewards = useTinballStore((state) => state.rewards);
  const points = useTinballStore((state) => state.rewardPoints);
  const redeemLocal = useTinballStore((state) => state.redeemReward);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const redeem = useCallback(async (reward: Reward) => {
    setRedeemingId(reward.id);
    try {
      if (!isDemo) await apiRequest(`/api/v1/rewards/${reward.id}/redeem`, { method: 'POST', body: { idempotencyKey: randomUUID() } });
      redeemLocal(reward.id, reward.points);
      Alert.alert('Canje confirmado', 'Guardamos tu solicitud. Vas a recibir las instrucciones en Notificaciones.');
    } catch (caught) {
      Alert.alert('No pudimos completar el canje', caught instanceof Error ? caught.message : 'Intentá nuevamente.');
    } finally {
      setRedeemingId(null);
    }
  }, [isDemo, redeemLocal]);

  const render = useCallback(({ item }: { item: Reward }) => <Card accessibilityRole="button" disabled={redeemingId !== null || item.stock < 1} onPress={() => item.points <= points ? Alert.alert('Confirmar canje', `${item.title} por ${item.points} puntos.`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Canjear', onPress: () => { void redeem(item); } }]) : Alert.alert('Todavía no alcanza', `Te faltan ${item.points - points} puntos.`)}><StatusPill label={item.category} /><Name>{item.title}</Name><Sponsor>Presentado por {item.sponsor} · {item.stock} disponibles</Sponsor><Price>{redeemingId === item.id ? 'Procesando…' : `${item.points} puntos`}</Price></Card>, [points, redeem, redeemingId]);

  return <Screen><List data={rewards} keyExtractor={(item) => item.id} renderItem={render} ListHeaderComponent={<Header><ScreenTitle>Recompensas</ScreenTitle><BodyText>Ganás puntos con partidos verificados, rachas y aportes a la comunidad.</BodyText><Balance><BalanceValue>{points}</BalanceValue><BodyText>puntos disponibles · Premium suma 1,5× puntos, nunca ranking.</BodyText></Balance></Header>} /></Screen>;
}
