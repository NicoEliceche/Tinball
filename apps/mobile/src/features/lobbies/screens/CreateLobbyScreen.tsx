import { CreateLobbySchema, type LobbyMode, type MatchFormat, type Position, type SkillLevel } from '@tinball/contracts';
import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import type { Lobby } from '../../../core/types/lobby.types';
import { BodyText, Card, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { ErrorText, Field, FieldGroup, Helper, Label, NotesField, Option, Options, OptionText } from './CreateLobbyScreenStyled';

const modes: { value: LobbyMode; label: string; locked?: boolean }[] = [
  { value: 'NEED_ONE', label: 'Me falta uno' },
  { value: 'OPEN', label: 'Abierto' },
  { value: 'PREMADE', label: 'Premade' },
  { value: 'PRIZE', label: 'Con premio', locked: true },
];
const formats: { value: MatchFormat; label: string; players: number }[] = [
  { value: 'FIVE_A_SIDE', label: 'Fútbol 5', players: 10 },
  { value: 'SEVEN_A_SIDE', label: 'Fútbol 7', players: 14 },
  { value: 'EIGHT_A_SIDE', label: 'Fútbol 8', players: 16 },
  { value: 'ELEVEN_A_SIDE', label: 'Fútbol 11', players: 22 },
];
const positions: { value: Position; label: string }[] = [
  { value: 'GOALKEEPER', label: 'Arquero' }, { value: 'DEFENDER', label: 'Defensor' },
  { value: 'FULLBACK', label: 'Lateral' }, { value: 'MIDFIELDER', label: 'Volante' },
  { value: 'WINGER', label: 'Extremo' }, { value: 'FORWARD', label: 'Delantero' },
];
const levels: { value: SkillLevel; label: string }[] = [
  { value: 'BEGINNER', label: 'Inicial' }, { value: 'RECREATIONAL', label: 'Recreativo' },
  { value: 'INTERMEDIATE', label: 'Intermedio' }, { value: 'ADVANCED', label: 'Avanzado' },
  { value: 'COMPETITIVE', label: 'Competitivo' },
];

function tomorrowDate(): string {
  const value = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

export function CreateLobbyScreen() {
  const navigation = useNavigation();
  const { auth, isDemo } = useAuth();
  const profile = useTinballStore((state) => state.currentProfile);
  const addLobby = useTinballStore((state) => state.addLobby);
  const [mode, setMode] = useState<LobbyMode>('OPEN');
  const [format, setFormat] = useState<MatchFormat>('SEVEN_A_SIDE');
  const [title, setTitle] = useState('Partido del barrio');
  const [locality, setLocality] = useState(profile?.locality ?? '');
  const [date, setDate] = useState(tomorrowDate);
  const [time, setTime] = useState('20:00');
  const [duration, setDuration] = useState('60');
  const [skillMin, setSkillMin] = useState<SkillLevel>('RECREATIONAL');
  const [skillMax, setSkillMax] = useState<SkillLevel>('ADVANCED');
  const [positionsNeeded, setPositionsNeeded] = useState<Position[]>([]);
  const [price, setPrice] = useState('0');
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requiredPlayers = useMemo(() => formats.find((item) => item.value === format)?.players ?? 14, [format]);

  const create = async () => {
    const startsAt = new Date(`${date}T${time}:00`);
    if (!Number.isFinite(startsAt.getTime())) {
      setError('Usá una fecha AAAA-MM-DD y una hora HH:mm válidas.');
      return;
    }
    const input = {
      title: title.trim(), mode, format, locality: locality.trim(), startsAt: startsAt.toISOString(),
      durationMinutes: Number(duration), requiredPlayers, skillMin, skillMax, positionsNeeded,
      pricePerPlayerMinor: Math.round(Number(price.replace(',', '.')) * 100), currency: 'ARS', premiumOnly, notes: notes.trim(),
    };
    const parsed = CreateLobbySchema.safeParse(input);
    if (!parsed.success) {
      setError('Revisá duración, precio, nivel y campos obligatorios antes de publicar.');
      return;
    }
    if (startsAt.getTime() < Date.now() + 30 * 60 * 1000) {
      setError('El partido debe empezar al menos 30 minutos en el futuro.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = isDemo ? { id: `lobby-${Date.now()}` } : await apiRequest<{ id: string }>('/api/v1/lobbies', { method: 'POST', body: parsed.data });
      const lobby: Lobby = {
        id: result.id, title: parsed.data.title, organizerId: auth?.user.id, organizerName: auth?.user.displayName ?? 'Organizador', organizerAvatar: auth?.user.avatarUrl ?? '',
        mode: parsed.data.mode, format: parsed.data.format, locality: parsed.data.locality, venueName: 'A confirmar', startsAt: parsed.data.startsAt,
        durationMinutes: parsed.data.durationMinutes, joinedPlayers: 1, requiredPlayers: parsed.data.requiredPlayers, positionsNeeded: parsed.data.positionsNeeded,
        skillMin: parsed.data.skillMin, skillMax: parsed.data.skillMax, pricePerPlayerMinor: parsed.data.pricePerPlayerMinor, currency: parsed.data.currency,
        commitmentScore: profile?.reliability ?? 100, premiumOnly: parsed.data.premiumOnly, status: 'OPEN', notes: parsed.data.notes,
      };
      addLobby(lobby);
      Alert.alert('Lobby creado', 'Tu convocatoria quedó lista para recibir jugadores.', [{ text: 'Ver partidos', onPress: () => navigation.goBack() }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos crear el lobby.');
    } finally {
      setLoading(false);
    }
  };

  return <ScrollScreen>
    <ScreenTitle>Crear lobby</ScreenTitle>
    <BodyText>Publicá una convocatoria completa para que nadie tenga que adivinar horario, nivel o costo.</BodyText>
    <FieldGroup><Label>Tipo de convocatoria</Label><Options>{modes.map((item) => <Option key={item.value} $selected={mode === item.value} $locked={item.locked} disabled={item.locked} onPress={() => setMode(item.value)}><OptionText $selected={mode === item.value}>{item.label}</OptionText></Option>)}</Options><Helper>Los desafíos con premio siguen bloqueados hasta completar las aprobaciones legales y antifraude.</Helper></FieldGroup>
    <FieldGroup><Label>Formato</Label><Options>{formats.map((item) => <Option key={item.value} $selected={format === item.value} onPress={() => setFormat(item.value)}><OptionText $selected={format === item.value}>{item.label}</OptionText></Option>)}</Options><Helper>{requiredPlayers} jugadores en total.</Helper></FieldGroup>
    <FieldGroup><Label>Título</Label><Field value={title} onChangeText={setTitle} maxLength={80} accessibilityLabel="Título del lobby" /></FieldGroup>
    <FieldGroup><Label>Localidad</Label><Field value={locality} onChangeText={setLocality} maxLength={80} accessibilityLabel="Localidad" /></FieldGroup>
    <FieldGroup><Label>Fecha</Label><Field value={date} onChangeText={setDate} maxLength={10} placeholder="AAAA-MM-DD" accessibilityLabel="Fecha del partido" /></FieldGroup>
    <FieldGroup><Label>Hora</Label><Field value={time} onChangeText={setTime} maxLength={5} placeholder="HH:mm" accessibilityLabel="Hora del partido" /></FieldGroup>
    <FieldGroup><Label>Duración en minutos</Label><Field value={duration} onChangeText={setDuration} keyboardType="number-pad" maxLength={3} accessibilityLabel="Duración en minutos" /></FieldGroup>
    <FieldGroup><Label>Nivel mínimo</Label><Options>{levels.map((item) => <Option key={item.value} $selected={skillMin === item.value} onPress={() => setSkillMin(item.value)}><OptionText $selected={skillMin === item.value}>{item.label}</OptionText></Option>)}</Options></FieldGroup>
    <FieldGroup><Label>Nivel máximo</Label><Options>{levels.map((item) => <Option key={item.value} $selected={skillMax === item.value} onPress={() => setSkillMax(item.value)}><OptionText $selected={skillMax === item.value}>{item.label}</OptionText></Option>)}</Options></FieldGroup>
    <FieldGroup><Label>Posiciones que faltan</Label><Options>{positions.map((item) => { const selected = positionsNeeded.includes(item.value); return <Option key={item.value} $selected={selected} onPress={() => setPositionsNeeded((current) => selected ? current.filter((value) => value !== item.value) : [...current, item.value])}><OptionText $selected={selected}>{item.label}</OptionText></Option>; })}</Options><Helper>Opcional; ayuda a ordenar las solicitudes.</Helper></FieldGroup>
    <FieldGroup><Label>Precio estimado por jugador (ARS)</Label><Field value={price} onChangeText={setPrice} keyboardType="decimal-pad" maxLength={10} accessibilityLabel="Precio por jugador" /></FieldGroup>
    <FieldGroup><Label>Visibilidad</Label><Options><Option $selected={!premiumOnly} onPress={() => setPremiumOnly(false)}><OptionText $selected={!premiumOnly}>Toda la comunidad</OptionText></Option><Option $selected={premiumOnly} $locked={!auth?.user.isPremium} disabled={!auth?.user.isPremium} onPress={() => setPremiumOnly(true)}><OptionText $selected={premiumOnly}>Sólo Premium</OptionText></Option></Options>{!auth?.user.isPremium ? <Helper>Necesitás Premium para organizar convocatorias exclusivas.</Helper> : null}</FieldGroup>
    <FieldGroup><Label>Notas</Label><NotesField value={notes} onChangeText={setNotes} multiline textAlignVertical="top" maxLength={500} placeholder="Cancha, camisetas, llegada y cualquier detalle útil." accessibilityLabel="Notas del lobby" /><Helper>{notes.length}/500</Helper></FieldGroup>
    <Card><Label>Compromiso Tinball</Label><BodyText>Los participantes confirmarán asistencia. Una ausencia injustificada reduce confiabilidad y puede activar un enfriamiento.</BodyText></Card>
    {error ? <ErrorText accessibilityLiveRegion="polite">{error}</ErrorText> : null}
    <PrimaryButton label="Publicar lobby" icon="arrow-forward-circle-outline" loading={loading} disabled={loading} onPress={create} />
  </ScrollScreen>;
}
