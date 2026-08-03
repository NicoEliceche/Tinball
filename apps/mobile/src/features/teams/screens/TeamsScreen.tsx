import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { RootStackParamList } from '../../../navigation/types';
import { BodyText, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { formatLabels } from '../../../shared/utils/format';
import { Crest, CrestText, TeamCard, TeamCopy, TeamMeta, TeamName } from './TeamsScreenStyled';

export function TeamsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const teams = useTinballStore((state) => state.teams);
  return <ScrollScreen>
    <ScreenTitle>Mis equipos</ScreenTitle>
    <BodyText>Administrá vestuarios, chats, convocatorias y formaciones desde un solo lugar.</BodyText>
    {teams.map((team) => {
      const initials = team.name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
      return <TeamCard key={team.id} accessibilityRole="button" accessibilityLabel={`Abrir ${team.name}`} onPress={() => navigation.navigate('TeamDetail', { teamId: team.id })}><Crest $color={team.crestColor}><CrestText>{initials}</CrestText></Crest><TeamCopy><TeamName>{team.name}</TeamName><TeamMeta>{team.locality} · {formatLabels[team.format]} · {team.memberCount} integrantes</TeamMeta><TeamMeta>{team.rankPoints} puntos de equipo{team.isVerified ? ' · verificado' : ''}</TeamMeta></TeamCopy></TeamCard>;
    })}
    {teams.length === 0 ? <BodyText>Todavía no pertenecés a ningún equipo.</BodyText> : null}
    <PrimaryButton label="Crear otro equipo" icon="add-circle-outline" onPress={() => navigation.navigate('CreateTeam')} />
  </ScrollScreen>;
}
