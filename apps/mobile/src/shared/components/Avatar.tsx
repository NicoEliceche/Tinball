import { Image } from 'expo-image';
import styled from 'styled-components/native';

const AvatarImage = styled(Image)<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $size }) => $size / 2}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
`;

export function Avatar({ uri, name, size = 48 }: { uri: string | null; name: string; size?: number }) {
  return (
    <AvatarImage
      $size={size}
      source={uri ? { uri } : require('../../../assets/icon.png')}
      cachePolicy="memory-disk"
      contentFit="cover"
      transition={180}
      accessibilityLabel={`Foto de ${name}`}
    />
  );
}
