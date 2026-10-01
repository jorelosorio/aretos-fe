import { Circle, Image, SizableText } from 'tamagui';

import { TEXT } from '@/constants/layout';

const AVATAR_SIZE = '$5';

export function Avatar({ name, url }: { name: string; url: string }) {
  return (
    <Circle
      size={AVATAR_SIZE}
      items="center"
      justify="center"
      bg="$deco1"
      overflow="hidden"
    >
      {url === '' ? (
        <SizableText
          size={TEXT.heading}
          fontWeight="700"
          color="$accentSurfaceForeground"
        >
          {name.slice(0, 1).toUpperCase()}
        </SizableText>
      ) : (
        <Image
          source={{ uri: url }}
          width="100%"
          height="100%"
          accessibilityIgnoresInvertColors
        />
      )}
    </Circle>
  );
}
