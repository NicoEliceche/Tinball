import { useState } from 'react';
import { Alert, Linking, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../core/providers/AuthProvider';
import { AppLogo } from '../../../shared/components/AppLogo';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { useGoogleSignIn } from '../services/useGoogleSignIn';
import {
  AuthCard,
  Background,
  CardText,
  CardTitle,
  Content,
  DemoButton,
  DemoText,
  ErrorBox,
  ErrorText,
  Hero,
  HeroCopy,
  Kicker,
  LegalText,
  LegalLink,
  Screen,
  Scroll,
  Subtitle,
  Title,
} from './LoginScreenStyled';

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { loginWithGoogle, enterDemo } = useAuth();
  const google = useGoogleSignIn();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const landscape = width > height && height < 650;
  const showDemo = __DEV__ && process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE === 'true';
  const openLegal = async (url: string | undefined, label: string) => {
    if (!url) { Alert.alert(label, 'El documento todavía no tiene una URL pública configurada.'); return; }
    try { await Linking.openURL(url); } catch { Alert.alert('No pudimos abrir el documento', 'Intentá nuevamente o contactá a soporte.'); }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const idToken = await google.signIn();
      if (idToken) await loginWithGoogle(idToken);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Background />
      <Scroll>
        <Content $top={Math.max(insets.top + 20, 28)} $bottom={Math.max(insets.bottom + 20, 28)} $landscape={landscape}>
          <Hero $landscape={landscape}>
            <AppLogo size={landscape ? 150 : 190} />
            <HeroCopy>
              <Kicker>El fútbol se arma acá</Kicker>
              <Title>Tu próximo partido empieza en Tinball</Title>
              <Subtitle>Encontrá jugadores confiables, completá tu equipo y competí en tu zona.</Subtitle>
            </HeroCopy>
          </Hero>

          <AuthCard>
            <CardTitle>Entrá a la cancha</CardTitle>
            <CardText>Usamos Google para verificar tu cuenta y proteger la reputación de la comunidad.</CardText>
            {error ? <ErrorBox accessibilityLiveRegion="polite"><ErrorText>{error}</ErrorText></ErrorBox> : null}
            <PrimaryButton
              label="Continuar con Google"
              icon="logo-google"
              loading={loading}
              disabled={!google.ready || loading}
              onPress={handleGoogle}
            />
            {google.configurationError ? <ErrorText>{google.configurationError}</ErrorText> : null}
            {showDemo ? (
              <DemoButton accessibilityRole="button" accessibilityLabel="Explorar modo demo" onPress={enterDemo}>
                <DemoText>Explorar el producto en modo demo</DemoText>
              </DemoButton>
            ) : null}
            <LegalText>Al continuar aceptás los <LegalLink accessibilityRole="link" onPress={() => { void openLegal(process.env.EXPO_PUBLIC_TERMS_URL, 'Términos'); }}>Términos</LegalLink> y la <LegalLink accessibilityRole="link" onPress={() => { void openLegal(process.env.EXPO_PUBLIC_PRIVACY_URL, 'Privacidad'); }}>Política de Privacidad</LegalLink>. Tinball nunca publica ni contacta a nadie sin tu acción.</LegalText>
          </AuthCard>
        </Content>
      </Scroll>
    </Screen>
  );
}
