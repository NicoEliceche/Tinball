import Ionicons from '@expo/vector-icons/Ionicons';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { randomUUID } from 'expo-crypto';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { ChatMessage } from '../../../core/types/social.types';
import type { RootStackParamList } from '../../../navigation/types';
import { Avoider, Composer, Input, List, Message, MessageText, Screen, Send, Sender, Time } from './ChatRoomScreenStyled';

interface MessageResponse {
  id: string;
  clientId: string;
  senderId: string;
  text: string;
  createdAt: string;
  sender: { displayName: string };
}

const toMessage = (message: MessageResponse): ChatMessage => ({ id: message.id, clientId: message.clientId, senderId: message.senderId, senderName: message.sender.displayName, text: message.text, createdAt: message.createdAt, status: 'SENT' });

export function ChatRoomScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ChatRoom'>>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { auth, isDemo } = useAuth();
  const messages = useTinballStore((state) => state.messages[route.params.conversationId] ?? []);
  const sendDemoMessage = useTinballStore((state) => state.sendMessage);
  const setConversationMessages = useTinballStore((state) => state.setConversationMessages);
  const appendMessage = useTinballStore((state) => state.appendMessage);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isDemo) return;
    let active = true;
    apiRequest<{ items: MessageResponse[] }>(`/api/v1/conversations/${route.params.conversationId}/messages`)
      .then((response) => { if (active) setConversationMessages(route.params.conversationId, response.items.map(toMessage)); })
      .catch((caught: unknown) => { if (active) Alert.alert('No pudimos cargar el chat', caught instanceof Error ? caught.message : 'Intentá nuevamente.'); });
    return () => { active = false; };
  }, [isDemo, route.params.conversationId, setConversationMessages]);

  const send = async () => {
    const messageText = text.trim();
    if (!messageText || sending) return;
    if (isDemo) {
      sendDemoMessage(route.params.conversationId, messageText);
      setText('');
      return;
    }
    setSending(true);
    try {
      const response = await apiRequest<MessageResponse>(`/api/v1/conversations/${route.params.conversationId}/messages`, { method: 'POST', body: { text: messageText, clientId: randomUUID() } });
      appendMessage(route.params.conversationId, toMessage(response));
      setText('');
    } catch (caught) {
      Alert.alert('No pudimos enviar el mensaje', caught instanceof Error ? caught.message : 'Intentá nuevamente.');
    } finally {
      setSending(false);
    }
  };

  const render = useCallback(({ item }: { item: ChatMessage }) => {
    const mine = item.senderId === auth?.user.id;
    return <Message $mine={mine}>{!mine ? <Sender>{item.senderName}</Sender> : null}<MessageText>{item.text}</MessageText><Time>{new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(new Date(item.createdAt))}</Time></Message>;
  }, [auth?.user.id]);

  return <Screen><Avoider behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={92}><List data={messages} keyExtractor={(item) => item.id} renderItem={render} /><Composer $bottom={insets.bottom}><Input value={text} onChangeText={setText} maxLength={2000} placeholder="Escribí un mensaje" accessibilityLabel="Mensaje" /><Send accessibilityRole="button" accessibilityLabel="Enviar mensaje" disabled={!text.trim() || sending} onPress={() => { void send(); }}><Ionicons name="send" size={20} color={theme.colors.onPrimary} /></Send></Composer></Avoider></Screen>;
}
