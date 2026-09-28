import { Image } from 'expo-image';
import { useThemeName } from '@tamagui/core';

import markDark from '@/assets/images/splash-icon-dark.png';
import markLight from '@/assets/images/splash-icon.png';

export const MARK_SIZE = { sm: 32, md: 48, lg: 96 } as const;

export function BrandMark({ size = 'sm' }: { size?: keyof typeof MARK_SIZE }) {
  const dark = useThemeName().startsWith('dark');
  const side = MARK_SIZE[size];

  return (
    <Image
      source={dark ? markDark : markLight}
      style={{ width: side, height: side }}
      contentFit="contain"
      accessible={false}
      accessibilityIgnoresInvertColors
    />
  );
}
