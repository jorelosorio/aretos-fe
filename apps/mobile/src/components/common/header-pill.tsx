import { SizableText, XStack, YStack, type ColorTokens } from 'tamagui';

import { ICON, TEXT } from '@/constants/layout';

import type { IconComponent } from './icon-component';

const MAX_WIDTH = 220;
const DOT = 8;

export function HeaderPill({
  label,
  dot,
  Icon,
  accent = false,
}: {
  label: string;
  dot?: ColorTokens;
  Icon?: IconComponent;
  accent?: boolean;
}) {
  return (
    <XStack
      items="center"
      gap="$1.5"
      px="$3"
      py="$1.5"
      rounded={999}
      bg="$muted"
      maxW={MAX_WIDTH}
      accessibilityRole="text"
    >
      {dot !== undefined && (
        <YStack
          width={DOT}
          height={DOT}
          rounded={DOT / 2}
          bg={dot}
          shrink={0}
        />
      )}
      {Icon !== undefined && (
        <Icon
          size={ICON.inline}
          color={accent ? '$primary' : '$mutedForeground'}
        />
      )}
      <SizableText
        shrink={1}
        size={TEXT.body}
        fontWeight="600"
        color={accent ? '$primary' : '$color'}
        numberOfLines={1}
      >
        {label}
      </SizableText>
    </XStack>
  );
}
