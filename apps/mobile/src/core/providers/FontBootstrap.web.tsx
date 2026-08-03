import { useFonts } from 'expo-font';
import type { PropsWithChildren } from 'react';
import { LoadingScreen } from '../../shared/components/ScreenState';

const fontAssets = {
  Barlow_400Regular: require('../../../assets/fonts/Barlow_400Regular.ttf'),
  Barlow_500Medium: require('../../../assets/fonts/Barlow_500Medium.ttf'),
  Barlow_600SemiBold: require('../../../assets/fonts/Barlow_600SemiBold.ttf'),
  Barlow_700Bold: require('../../../assets/fonts/Barlow_700Bold.ttf'),
  BarlowCondensed_700Bold: require('../../../assets/fonts/BarlowCondensed_700Bold.ttf'),
  BarlowCondensed_800ExtraBold: require('../../../assets/fonts/BarlowCondensed_800ExtraBold.ttf'),
};

export function FontBootstrap({ children }: PropsWithChildren) {
  const [loaded] = useFonts(fontAssets);
  return loaded ? children : <LoadingScreen message="Cargando identidad Tinball…" />;
}
