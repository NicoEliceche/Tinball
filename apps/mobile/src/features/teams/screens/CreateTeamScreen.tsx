import { CreateTeamSchema, type MatchFormat } from '@tinball/contracts';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert } from 'react-native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { Team } from '../../../core/types/match.types';
import { BodyText, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { Color, Colors, ErrorText, Field, Group, Label, Option, Options, OptionText } from './CreateTeamScreenStyled';

const formats: { value: MatchFormat; label: string }[] = [{ value: 'FIVE_A_SIDE', label: 'Fútbol 5' }, { value: 'SEVEN_A_SIDE', label: 'Fútbol 7' }, { value: 'EIGHT_A_SIDE', label: 'Fútbol 8' }, { value: 'ELEVEN_A_SIDE', label: 'Fútbol 11' }];
const colors = ['#2FD05A', '#22C7F2', '#F5B942', '#F0445A', '#8B5CF6'];

export function CreateTeamScreen() {
  const navigation = useNavigation();
  const { isDemo } = useAuth();
  const profile = useTinballStore((state) => state.currentProfile);
  const addTeam = useTinballStore((state) => state.addTeam);
  const [name, setName] = useState('');
  const [locality, setLocality] = useState(profile?.locality ?? '');
  const [format, setFormat] = useState<MatchFormat>('SEVEN_A_SIDE');
  const [crestColor, setCrestColor] = useState(colors[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const create = async () => {
    const parsed = CreateTeamSchema.safeParse({ name, locality, format, crestColor });
    if (!parsed.success) { setError('Completá un nombre y una localidad válidos.'); return; }
    setLoading(true); setError('');
    try {
      const response = isDemo ? { id: `team-${Date.now()}`, conversationId: `chat-team-${Date.now()}` } : await apiRequest<{ id: string; conversationId: string }>('/api/v1/teams', { method: 'POST', body: parsed.data });
      const team: Team = { id: response.id, name: parsed.data.name, crestColor: parsed.data.crestColor, locality: parsed.data.locality, memberCount: 1, format: parsed.data.format, wins: 0, losses: 0, draws: 0, rankPoints: 1000, isVerified: false, canManage: true, conversationId: response.conversationId, members: [] };
      addTeam(team);
      Alert.alert('Equipo creado', 'Sos el capitán. Ahora podés invitar jugadores y organizar el próximo partido.', [{ text: 'Listo', onPress: () => navigation.goBack() }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos crear el equipo.');
    } finally {
      setLoading(false);
    }
  };

  return <ScrollScreen>
    <ScreenTitle>Crear equipo</ScreenTitle><BodyText>Definí la identidad inicial. Después vas a poder sumar administradores, jugadores e invitados.</BodyText>
    <Group><Label>Nombre</Label><Field value={name} onChangeText={setName} maxLength={80} placeholder="Ej. Los del Parque" accessibilityLabel="Nombre del equipo" /></Group>
    <Group><Label>Localidad</Label><Field value={locality} onChangeText={setLocality} maxLength={80} placeholder="Ej. Palermo" accessibilityLabel="Localidad del equipo" /></Group>
    <Group><Label>Formato principal</Label><Options>{formats.map((item) => <Option key={item.value} $selected={format === item.value} onPress={() => setFormat(item.value)}><OptionText $selected={format === item.value}>{item.label}</OptionText></Option>)}</Options></Group>
    <Group><Label>Color del escudo</Label><Colors>{colors.map((color) => <Color key={color} $color={color} $selected={crestColor === color} accessibilityRole="button" accessibilityLabel={`Color ${color}`} accessibilityState={{ selected: crestColor === color }} onPress={() => setCrestColor(color)} />)}</Colors></Group>
    {error ? <ErrorText accessibilityLiveRegion="polite">{error}</ErrorText> : null}
    <PrimaryButton label="Crear equipo" icon="people-outline" loading={loading} disabled={loading} onPress={() => { void create(); }} />
  </ScrollScreen>;
}
