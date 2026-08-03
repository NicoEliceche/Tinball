import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from 'styled-components/native';
import type { Player } from '../../../core/types/player.types';
import { FootballRating } from '../../../shared/components/FootballRating';
import { StatusPill } from '../../../shared/components/StatusPill';
import { positionLabels, skillLabels } from '../../../shared/utils/format';
import { Action, Actions, ActionText, Bio, Card, Content, Header, Meta, Name, Photo, Tag, TagRow, TagText } from './PlayerCardStyled';

export function PlayerCard({ player, onPass, onInvite, onOpen }: { player: Player; onPass: () => void; onInvite: () => void; onOpen: () => void }) {
  const theme = useTheme();
  return (
    <Card>
      <Photo source={player.avatarUrl ? { uri: player.avatarUrl } : require('../../../../assets/icon.png')} contentFit="cover" cachePolicy="memory-disk" transition={200} accessibilityLabel={`Foto de ${player.displayName}`} />
      <Content>
        <Header>
          <Name onPress={onOpen} accessibilityRole="link">{player.displayName}, {player.age}</Name>
          {player.isVerified ? <StatusPill label="Verificado" tone="primary" icon="shield-checkmark-outline" /> : null}
        </Header>
        <Meta>{positionLabels[player.primaryPosition]} · {skillLabels[player.skillLevel]} · {player.locality} · {player.distanceKm.toFixed(1)} km</Meta>
        <FootballRating value={player.rating} count={player.reviewCount} />
        <Bio>{player.bio}</Bio>
        <TagRow>{player.tags.map((tag) => <Tag key={tag}><TagText>{tag}</TagText></Tag>)}</TagRow>
        <Meta>Confiabilidad {player.reliability}% · {player.matchesPlayed} partidos</Meta>
        <Actions>
          <Action $accept={false} accessibilityRole="button" accessibilityLabel={`Descartar a ${player.displayName}`} onPress={onPass}>
            <Ionicons name="close" size={23} color={theme.colors.danger} /><ActionText $accept={false}>Pasar</ActionText>
          </Action>
          <Action $accept accessibilityRole="button" accessibilityLabel={`Invitar a ${player.displayName}`} onPress={onInvite}>
            <Ionicons name="checkmark" size={23} color={theme.colors.primary} /><ActionText $accept>Invitar</ActionText>
          </Action>
        </Actions>
      </Content>
    </Card>
  );
}
