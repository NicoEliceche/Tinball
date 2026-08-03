import { Platform } from 'react-native';
import { apiRequest } from '../client/apiClient';

export async function exportAccountData(): Promise<void> {
  const data = await apiRequest<Record<string, unknown>>('/api/v1/account/export');
  const content = JSON.stringify(data, null, 2);
  const filename = `tinball-datos-${new Date().toISOString().slice(0, 10)}.json`;
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    return;
  }
  const fileSystem = await import('expo-file-system/legacy');
  const Sharing = await import('expo-sharing');
  if (!fileSystem.cacheDirectory) throw new Error('No hay almacenamiento temporal disponible.');
  const fileUri = `${fileSystem.cacheDirectory}${filename}`;
  await fileSystem.writeAsStringAsync(fileUri, content);
  if (!(await Sharing.isAvailableAsync())) throw new Error('Este dispositivo no permite compartir archivos.');
  await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Guardar datos de Tinball' });
}

export function deleteAccount(idToken: string): Promise<void> {
  return apiRequest<void>('/api/v1/account', { method: 'DELETE', body: { idToken } });
}
