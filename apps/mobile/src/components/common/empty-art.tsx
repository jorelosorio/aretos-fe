import { useWindowDimensions } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import type { Check } from '@tamagui/lucide-icons-2';

import { ILLUSTRATION_SIZE } from '@/constants/layout';

type IconComponent = typeof Check;

export function EmptyArt({
  Icon,
  illustration,
}: {
  Icon: IconComponent;
  illustration?: ImageSourcePropType;
}) {
  const { width, height } = useWindowDimensions();

  if (!illustration) return <Icon size={32} color="$primary" />;

  const size = Math.min(
    width * ILLUSTRATION_SIZE.widthRatio,
    height * ILLUSTRATION_SIZE.heightRatio,
    ILLUSTRATION_SIZE.max,
  );

  return (
    <Image
      source={illustration}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessibilityIgnoresInvertColors
    />
  );
}
