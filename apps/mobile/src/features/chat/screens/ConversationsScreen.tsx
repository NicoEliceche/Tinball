import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { useTheme } from 'styled-components/native';
import type { Conversation } from '../../../core/types/social.types';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { RootStackParamList } from '../../../navigation/types';
import { BodyText, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { Badge, BadgeText, ConversationRow, Copy, Header, List, Screen, Subtitle, Title } from './ConversationsScreenStyled';
export function ConversationsScreen() { const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>(); const theme = useTheme(); const conversations = useTinballStore((state) => state.conversations); const render = useCallback(({ item }: { item: Conversation }) => <ConversationRow accessibilityRole="button" accessibilityLabel={`${item.title}, ${item.unreadCount} sin leer`} onPress={() => navigation.navigate('ChatRoom', { conversationId: item.id, title: item.title })}><Ionicons name={item.kind === 'TEAM' ? 'people-outline' : item.kind === 'MATCH' ? 'football-outline' : 'grid-outline'} size={24} color={theme.colors.primary} /><Copy><Title>{item.title}</Title><Subtitle numberOfLines={1}>{item.subtitle}</Subtitle></Copy>{item.unreadCount > 0 ? <Badge><BadgeText>{item.unreadCount}</BadgeText></Badge> : null}</ConversationRow>, [navigation, theme.colors.primary]); return <Screen><List data={conversations} keyExtractor={(item) => item.id} renderItem={render} ListHeaderComponent={<Header><ScreenTitle>Chats</ScreenTitle><BodyText>Sólo aparecen equipos, partidos y lobbies donde sos integrante.</BodyText></Header>} /></Screen>; }

