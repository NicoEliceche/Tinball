import { CompleteProfileSchema, type Position, type SkillLevel } from '@tinball/contracts';
import { useState } from 'react';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { BioField, Chip, Chips, ChipText, Copy, ErrorText, Field, FormSection, Helper, Intro, Label, RequiredMark, Step, Title } from './OnboardingScreenStyled';

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
const feet = [
  { value: 'RIGHT', label: 'Derecha' },
  { value: 'LEFT', label: 'Izquierda' },
  { value: 'BOTH', label: 'Ambas' },
] as const;

export function OnboardingScreen({ editing = false, onSaved }: { editing?: boolean; onSaved?: () => void }) {
  const { auth, finishOnboarding } = useAuth();
  const existing = useTinballStore((state) => state.currentProfile);
  const updateCurrentProfile = useTinballStore((state) => state.updateCurrentProfile);
  const [displayName, setDisplayName] = useState(auth?.user.displayName ?? '');
  const [nickname, setNickname] = useState(existing?.nickname ?? '');
  const [birthDate, setBirthDate] = useState(existing?.birthDate ?? '');
  const [locality, setLocality] = useState(existing?.locality ?? '');
  const [province, setProvince] = useState(existing?.province ?? 'Buenos Aires');
  const [position, setPosition] = useState<Position>(existing?.primaryPosition ?? 'MIDFIELDER');
  const [secondaryPositions, setSecondaryPositions] = useState<Position[]>(existing?.secondaryPositions ?? []);
  const [level, setLevel] = useState<SkillLevel>(existing?.skillLevel ?? 'INTERMEDIATE');
  const [preferredFoot, setPreferredFoot] = useState<(typeof feet)[number]['value']>(existing?.preferredFoot ?? 'RIGHT');
  const [bio, setBio] = useState(existing?.bio ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    const input = {
      displayName: displayName.trim(),
      nickname: nickname.trim(),
      birthDate,
      locality: locality.trim(),
      province: province.trim(),
      primaryPosition: position,
      secondaryPositions,
      skillLevel: level,
      preferredFoot,
      bio: bio.trim(),
    };
    const parsed = CompleteProfileSchema.safeParse(input);
    if (!parsed.success) {
      setError('Revisá los campos. La fecha debe usar AAAA-MM-DD y todos los datos obligatorios deben estar completos.');
      return;
    }
    const born = new Date(`${birthDate}T00:00:00.000Z`);
    const today = new Date();
    const age = today.getUTCFullYear() - born.getUTCFullYear()
      - (today.getUTCMonth() < born.getUTCMonth() || (today.getUTCMonth() === born.getUTCMonth() && today.getUTCDate() < born.getUTCDate()) ? 1 : 0);
    if (age < 16) {
      setError('Tenés que tener al menos 16 años para usar Tinball.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await finishOnboarding(parsed.data);
      if (editing && existing) updateCurrentProfile({ ...existing, nickname: parsed.data.nickname || null, birthDate: parsed.data.birthDate, locality: parsed.data.locality, province: parsed.data.province, primaryPosition: parsed.data.primaryPosition, secondaryPositions: parsed.data.secondaryPositions, skillLevel: parsed.data.skillLevel, preferredFoot: parsed.data.preferredFoot, bio: parsed.data.bio });
      onSaved?.();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos guardar tu perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollScreen>
      <Intro><Step>{editing ? 'Mi perfil' : 'Perfil inicial'}</Step><Title>{editing ? 'Actualizá tu juego' : 'Contanos cómo jugás'}</Title><Copy>Esto mejora las sugerencias y ayuda a formar partidos parejos. Podés cambiarlo cuando necesites.</Copy></Intro>
      <FormSection>
        <Label>Nombre visible <RequiredMark>*</RequiredMark></Label>
        <Field accessibilityLabel="Nombre visible" placeholder="Ej. Nico E." value={displayName} onChangeText={setDisplayName} autoCapitalize="words" maxLength={50} />
      </FormSection>
      <FormSection>
        <Label>Apodo</Label>
        <Field accessibilityLabel="Apodo" placeholder="Ej. Tano, Capi, Lucho" value={nickname} onChangeText={setNickname} autoCapitalize="words" maxLength={30} />
        <Helper>Opcional. Si lo completás, se usa en el saludo y en recordatorios.</Helper>
      </FormSection>
      <FormSection>
        <Label>Fecha de nacimiento <RequiredMark>*</RequiredMark></Label>
        <Field accessibilityLabel="Fecha de nacimiento" placeholder="AAAA-MM-DD" value={birthDate} onChangeText={setBirthDate} autoCapitalize="none" maxLength={10} />
        <Helper>Debés tener al menos 16 años. La fecha nunca se muestra públicamente.</Helper>
      </FormSection>
      <FormSection>
        <Label>Localidad <RequiredMark>*</RequiredMark></Label>
        <Field accessibilityLabel="Localidad" placeholder="Ej. Palermo" value={locality} onChangeText={setLocality} autoCapitalize="words" maxLength={80} />
        <Helper>Mostramos una zona aproximada; nunca tu domicilio.</Helper>
      </FormSection>
      <FormSection>
        <Label>Provincia <RequiredMark>*</RequiredMark></Label>
        <Field accessibilityLabel="Provincia" value={province} onChangeText={setProvince} autoCapitalize="words" maxLength={80} />
      </FormSection>
      <FormSection><Label>Posición principal <RequiredMark>*</RequiredMark></Label><Chips>{positions.map((item) => <Chip key={item.value} $selected={position === item.value} accessibilityRole="button" accessibilityState={{ selected: position === item.value }} onPress={() => setPosition(item.value)}><ChipText $selected={position === item.value}>{item.label}</ChipText></Chip>)}</Chips></FormSection>
      <FormSection>
        <Label>Posiciones secundarias</Label>
        <Chips>{positions.filter((item) => item.value !== position).map((item) => {
          const selected = secondaryPositions.includes(item.value);
          return <Chip key={item.value} $selected={selected} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setSecondaryPositions((current) => selected ? current.filter((value) => value !== item.value) : current.length < 3 ? [...current, item.value] : current)}><ChipText $selected={selected}>{item.label}</ChipText></Chip>;
        })}</Chips>
        <Helper>Opcional. Elegí hasta tres.</Helper>
      </FormSection>
      <FormSection><Label>Nivel <RequiredMark>*</RequiredMark></Label><Chips>{levels.map((item) => <Chip key={item.value} $selected={level === item.value} accessibilityRole="button" accessibilityState={{ selected: level === item.value }} onPress={() => setLevel(item.value)}><ChipText $selected={level === item.value}>{item.label}</ChipText></Chip>)}</Chips></FormSection>
      <FormSection><Label>Pie hábil <RequiredMark>*</RequiredMark></Label><Chips>{feet.map((item) => <Chip key={item.value} $selected={preferredFoot === item.value} accessibilityRole="button" accessibilityState={{ selected: preferredFoot === item.value }} onPress={() => setPreferredFoot(item.value)}><ChipText $selected={preferredFoot === item.value}>{item.label}</ChipText></Chip>)}</Chips></FormSection>
      <FormSection>
        <Label>Tu juego en pocas palabras</Label>
        <BioField accessibilityLabel="Descripción de tu juego" placeholder="Ej. Volante mixto, buen pase y juego limpio." value={bio} onChangeText={setBio} multiline maxLength={280} textAlignVertical="top" />
        <Helper>{bio.length}/280</Helper>
      </FormSection>
      {error ? <ErrorText accessibilityLiveRegion="polite">{error}</ErrorText> : null}
      <PrimaryButton label={editing ? 'Guardar cambios' : 'Completar perfil'} icon="checkmark-circle-outline" loading={loading} onPress={submit} />
    </ScrollScreen>
  );
}
