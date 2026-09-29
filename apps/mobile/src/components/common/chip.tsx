import { X } from '@tamagui/lucide-icons-2/icons/X';
import { SizableText, XStack, YStack, type ColorTokens } from 'tamagui';

import { HIT_SLOP, ICON, TEXT } from '@/constants/layout';

import type { IconComponent } from './icon-component';

const WRAPPING_RADIUS = 14;
const MARK_ICON = 11;
const MARK_DOT = 8;

export type ChipProps = {
  label: string;
  size?: 'small' | 'regular';
  lines?: 1 | 2;
  inField?: boolean;
  raised?: boolean;
  Icon?: IconComponent;
  dot?: ColorTokens;
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
  inField = false,
  raised = false,
  Icon,
  dot,
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
  const marked = Icon !== undefined || dot !== undefined;

  return (
    <XStack
      items="center"
      gap="$1"
      pl={marked ? '$2' : '$2.5'}
      pr={onRemove === undefined ? '$2.5' : '$1.5'}
      py="$1"
      maxW="100%"
      rounded={lines === 1 ? 999 : WRAPPING_RADIUS}
      bg={
        active
          ? '$primary'
          : inField
            ? '$fieldChip'
            : raised
              ? '$card'
              : '$muted'
      }
      borderWidth={raised && !active ? 1 : 0}
      borderColor="$border"
      onPress={onPress}
      pressStyle={onPress === undefined ? undefined : { opacity: 0.7 }}
      accessibilityRole={onPress === undefined ? 'text' : 'button'}
      accessibilityState={selected === undefined ? undefined : { selected }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {marked && (
        <YStack mr="$1">
          {Icon !== undefined ? (
            <Icon size={MARK_ICON} color={mark} />
          ) : (
            <YStack
              width={MARK_DOT}
              height={MARK_DOT}
              rounded={MARK_DOT / 2}
              bg={active ? '$primaryForeground' : dot}
            />
          )}
        </YStack>
      )}
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
