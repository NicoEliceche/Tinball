export interface FeedPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorBadge?: string;
  body: string;
  kind: 'GENERAL' | 'RESULT' | 'LOOKING_FOR_PLAYERS' | 'ACHIEVEMENT';
  createdAt: string;
  likes: number;
  comments: number;
  liked: boolean;
  matchScore?: string;
  matchLabel?: string;
}

export interface ChatMessage {
  id: string;
  clientId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  status: 'SENDING' | 'SENT' | 'FAILED';
}

export interface Conversation {
  id: string;
  title: string;
  subtitle: string;
  unreadCount: number;
  updatedAt: string;
  kind: 'TEAM' | 'MATCH' | 'LOBBY';
}

