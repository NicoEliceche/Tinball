import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Linking, Switch } from 'react-native';
import { useTheme } from 'styled-components/native';
import { apiRequest } from '../../../core/data/client/apiClient';
import { deleteAccount as deleteAccountRequest, exportAccountData } from '../../../core/data/services/accountService';
import { useThemePreferences } from '../../../core/providers/AppThemeProvider';
import { useAuth } from '../../../core/providers/AuthProvider';
import { useTinballStore } from '../../../core/store/useTinballStore';
import { useGoogleSignIn } from '../../auth/services/useGoogleSignIn';
import { BodyText, Card, CardTitle, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScrollScreen } from '../../../shared/layout/ScreenLayout';
import { Copy, Helper, Label, SettingRow } from './SettingsScreenStyled';
import type { RootStackParamList } from '../../../navigation/types';

export function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const themePreferences = useThemePreferences();
  const { isDemo, logout } = useAuth();
  const google = useGoogleSignIn();
  const saved = useTinballStore((state) => state.settings);
  const updateSettings = useTinballStore((state) => state.updateSettings);
  const [messages, setMessages] = useState(saved.pushMessages);
  const [matches, setMatches] = useState(saved.pushMatches);
  const [ranking, setRanking] = useState(saved.pushRanking);
  const [precise, setPrecise] = useState(saved.showExactDistance);
  const [discoverable, setDiscoverable] = useState(saved.allowDiscovery);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const openLegal = async (url: string | undefined, label: string) => {
    if (!url) { Alert.alert(label, 'Configurá la URL pública antes del lanzamiento. El borrador está en la carpeta docs.'); return; }
    try { await Linking.openURL(url); } catch { Alert.alert('No pudimos abrir el documento', 'Intentá nuevamente.'); }
  };

  const preferencesPayload = () => ({ ...saved, themeMode: themePreferences.mode, pushMessages: messages, pushMatches: matches, pushRanking: ranking, showExactDistance: precise, allowDiscovery: discoverable });
  const save = async () => {
    const input = preferencesPayload();
    setSaving(true);
    try {
      if (!isDemo) await apiRequest('/api/v1/profile/settings', { method: 'PUT', body: input });
      updateSettings(input);
      Alert.alert('Preferencias guardadas', 'Tus ajustes ya se aplican en todos tus dispositivos.');
    } catch (caught) {
      Alert.alert('No pudimos guardar', caught instanceof Error ? caught.message : 'Intentá nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    if (isDemo) { Alert.alert('Modo demo', 'La exportación está disponible para cuentas reales.'); return; }
    setExporting(true);
    try {
      await exportAccountData();
    } catch (caught) {
      Alert.alert('No pudimos exportar tus datos', caught instanceof Error ? caught.message : 'Intentá nuevamente.');
    } finally {
      setExporting(false);
    }
  };

  const deleteAccount = () => {
    if (isDemo) { Alert.alert('Modo demo', 'No hay una cuenta real para eliminar.'); return; }
    Alert.alert('Eliminar cuenta definitivamente', 'Se borrarán tu acceso, perfil y contenido personal. Los registros mínimos antifraude o legales quedarán seudonimizados. Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => {
        void (async () => {
          try {
            const idToken = await google.signIn();
            if (!idToken) return;
            await deleteAccountRequest(idToken);
            await logout();
          } catch (caught) {
            Alert.alert('No pudimos eliminar la cuenta', caught instanceof Error ? caught.message : 'Intentá nuevamente.');
          }
        })();
      } },
    ]);
  };

  return <ScrollScreen>
    <ScreenTitle>Configuración</ScreenTitle>
    <Card><CardTitle>Apariencia</CardTitle><SettingRow><Copy><Label>Modo oscuro</Label><Helper>Desactivado usa el modo claro; podés seguir el sistema desde una próxima versión.</Helper></Copy><Switch value={themePreferences.resolvedMode === 'dark'} onValueChange={(value) => themePreferences.setMode(value ? 'dark' : 'light')} trackColor={{ false: theme.colors.surfaceElevated, true: theme.colors.primaryStrong }} /></SettingRow></Card>
    <Card><CardTitle>Notificaciones</CardTitle><SettingRow><Copy><Label>Mensajes</Label><Helper>Chats de equipos, partidos y lobbies.</Helper></Copy><Switch value={messages} onValueChange={setMessages} trackColor={{ false: theme.colors.surfaceElevated, true: theme.colors.primaryStrong }} /></SettingRow><SettingRow><Copy><Label>Confirmaciones de partido</Label><Helper>Recordatorios 24 h y 3 h antes.</Helper></Copy><Switch value={matches} onValueChange={setMatches} trackColor={{ false: theme.colors.surfaceElevated, true: theme.colors.primaryStrong }} /></SettingRow><SettingRow><Copy><Label>Ranking y recompensas</Label><Helper>Cambios de posición, puntos y canjes.</Helper></Copy><Switch value={ranking} onValueChange={setRanking} trackColor={{ false: theme.colors.surfaceElevated, true: theme.colors.primaryStrong }} /></SettingRow></Card>
    <Card><CardTitle>Privacidad</CardTitle><SettingRow><Copy><Label>Aparecer en búsquedas</Label><Helper>Podés pausar Me falta uno sin borrar tu perfil.</Helper></Copy><Switch value={discoverable} onValueChange={setDiscoverable} trackColor={{ false: theme.colors.surfaceElevated, true: theme.colors.primaryStrong }} /></SettingRow><SettingRow><Copy><Label>Mostrar distancia exacta</Label><Helper>Recomendado desactivado; mostramos sólo una aproximación.</Helper></Copy><Switch value={precise} onValueChange={setPrecise} trackColor={{ false: theme.colors.surfaceElevated, true: theme.colors.primaryStrong }} /></SettingRow><BodyText>La app no necesita ubicación en segundo plano. El check-in conserva el evento, no tus coordenadas precisas.</BodyText><PrimaryButton label="Administrar bloqueos" icon="ban-outline" variant="secondary" onPress={() => navigation.navigate('BlockedPlayers')} /></Card>
    <PrimaryButton label="Guardar preferencias" icon="save-outline" loading={saving} disabled={saving} onPress={() => { void save(); }} />
    <Card><CardTitle>Legal y comunidad</CardTitle><PrimaryButton label="Política de Privacidad" icon="document-text-outline" variant="secondary" onPress={() => { void openLegal(process.env.EXPO_PUBLIC_PRIVACY_URL, 'Privacidad'); }} /><PrimaryButton label="Términos de uso" icon="reader-outline" variant="secondary" onPress={() => { void openLegal(process.env.EXPO_PUBLIC_TERMS_URL, 'Términos'); }} /><PrimaryButton label="Reglas de la comunidad" icon="people-outline" variant="secondary" onPress={() => { void openLegal(process.env.EXPO_PUBLIC_COMMUNITY_RULES_URL, 'Reglas de la comunidad'); }} /></Card>
    <Card><CardTitle>Cuenta y datos</CardTitle><PrimaryButton label="Descargar mis datos" icon="download-outline" variant="secondary" loading={exporting} disabled={exporting} onPress={() => { void exportData(); }} /><PrimaryButton label="Eliminar mi cuenta" icon="trash-outline" variant="danger" disabled={!google.ready && !isDemo} onPress={deleteAccount} /></Card>
  </ScrollScreen>;
}
