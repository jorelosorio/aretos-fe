import type { ReactNode } from 'react';
import { X } from '@tamagui/lucide-icons-2';
import { SizableText, XStack, YStack } from 'tamagui';

import { ICON, TEXT } from '@/constants/layout';

const HIT_SLOP = 8;
const WRAPPING_RADIUS = 14;

export type ChipLeading = (active: boolean) => ReactNode;

export type ChipProps = {
  label: string;
  size?: 'small' | 'regular';
  lines?: 1 | 2;
  leading?: ChipLeading;
  selected?: boolean;
  highlighted?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  onRemove?: () => void;
  removeLabel?: string;
};

export function Chip({
  label,
  size = 'small',
  lines = 1,
  leading,
  selected,
  highlighted = false,
  onPress,
  accessibilityLabel,
  onRemove,
  removeLabel,
}: ChipProps) {
  const active = selected === true || highlighted;
  const text = active ? '$primaryForeground' : '$color';
  const mark = active ? '$primaryForeground' : '$mutedForeground';

  return (
    <XStack
      items="center"
      gap="$1"
      pl={leading === undefined ? '$2.5' : '$2'}
      pr={onRemove === undefined ? '$2.5' : '$1.5'}
      py="$1"
      maxW="100%"
      rounded={lines === 1 ? 999 : WRAPPING_RADIUS}
      bg={active ? '$primary' : '$muted'}
      onPress={onPress}
      pressStyle={onPress === undefined ? undefined : { opacity: 0.7 }}
      accessibilityRole={onPress === undefined ? 'text' : 'button'}
      accessibilityState={selected === undefined ? undefined : { selected }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {leading !== undefined && <YStack mr="$1">{leading(active)}</YStack>}
      <SizableText
        shrink={1}
        size={size === 'small' ? TEXT.caption : TEXT.body}
        color={text}
        numberOfLines={lines}
      >
        {label}
      </SizableText>
      {onRemove !== undefined && (
        <YStack
          onPress={onRemove}
          hitSlop={HIT_SLOP}
          pressStyle={{ opacity: 0.6 }}
          accessibilityRole="button"
          accessibilityLabel={removeLabel}
        >
          <X size={ICON.inline} color={mark} />
        </YStack>
      )}
    </XStack>
  );
}
