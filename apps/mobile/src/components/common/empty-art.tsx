import { useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';

import { ILLUSTRATION_SIZE } from '@/constants/layout';

import type { IconComponent } from './icon-component';
import type { Illustration } from './illustrations';

export function EmptyArt({
  Icon,
  illustration,
}: {
  Icon: IconComponent;
  illustration?: Illustration;
}) {
  const { width, height } = useWindowDimensions();

  if (!illustration) return <Icon size={32} color="$primary" />;

  const size = Math.min(
    width * ILLUSTRATION_SIZE.widthRatio,
    height * ILLUSTRATION_SIZE.heightRatio,
    ILLUSTRATION_SIZE.max,
  );

  if (typeof illustration === 'function') {
    const Art = illustration;
    return <Art size={size} />;
  }

  return (
    <Image
      source={illustration}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessibilityIgnoresInvertColors
    />
  );
}
