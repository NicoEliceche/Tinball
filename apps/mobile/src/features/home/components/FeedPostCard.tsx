import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from 'styled-components/native';
import type { FeedPost } from '../../../core/types/social.types';
import { Avatar } from '../../../shared/components/Avatar';
import { formatShortDate } from '../../../shared/utils/format';
import { Action, Actions, ActionText, Author, AuthorCopy, AuthorRow, Body, Card, Score, ScoreBox, ScoreLabel, Time } from './FeedPostCardStyled';
export function FeedPostCard({ post, onLike }: { post: FeedPost; onLike: () => void }) {
  const theme = useTheme();
  return (
    <Card>
      <AuthorRow><Avatar uri={post.authorAvatar} name={post.authorName} size={44} /><AuthorCopy><Author>{post.authorName}</Author><Time>{post.authorBadge ? `${post.authorBadge} · ` : ''}{formatShortDate(post.createdAt)}</Time></AuthorCopy></AuthorRow>
      <Body>{post.body}</Body>
      {post.matchScore ? <ScoreBox><Score>{post.matchScore}</Score><ScoreLabel>{post.matchLabel}</ScoreLabel></ScoreBox> : null}
      <Actions>
        <Action accessibilityRole="button" accessibilityLabel={post.liked ? 'Quitar me gusta' : 'Me gusta'} onPress={onLike}><Ionicons name={post.liked ? 'heart' : 'heart-outline'} size={20} color={post.liked ? theme.colors.primary : theme.colors.textSecondary} /><ActionText $active={post.liked}>{post.likes}</ActionText></Action>
        <Action accessibilityRole="button" accessibilityLabel={`${post.comments} comentarios`}><Ionicons name="chatbubble-outline" size={19} color={theme.colors.textSecondary} /><ActionText>{post.comments}</ActionText></Action>
      </Actions>
    </Card>
  );
}

