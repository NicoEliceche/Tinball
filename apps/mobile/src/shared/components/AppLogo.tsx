import { Image } from 'expo-image';
import styled from 'styled-components/native';

const Logo = styled(Image)<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
`;

const logoSource = require('../../../assets/brand-logo.jpeg');

export function AppLogo({ size = 48 }: { size?: number }) {
  return <Logo $size={size} source={logoSource} contentFit="contain" accessibilityLabel="Logo de Tinball" />;
}

