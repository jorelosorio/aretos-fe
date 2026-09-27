import { Check } from '@tamagui/lucide-icons-2/icons/Check';
import { SizableText, Spinner, XStack, YStack } from 'tamagui';

import { ICON, SPACING, TEXT } from '@/constants/layout';

import type { IconComponent } from './icon-component';

export function ListRow({
  label,
  hint,
  Icon,
  TrailingIcon,
  selected,
  busy = false,
  disabled = false,
  onPress,
}: {
  label: string;
  hint?: string;
  Icon?: IconComponent;
  TrailingIcon?: IconComponent;
  selected?: boolean;
  busy?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const choice = selected !== undefined;
  const inactive = disabled || busy;

  return (
    <XStack
      onPress={inactive ? undefined : onPress}
      pressStyle={inactive ? undefined : { bg: '$cardPress' }}
      opacity={disabled ? 0.6 : 1}
      items="center"
      gap={SPACING.items}
      px={SPACING.card}
      py={SPACING.items}
      accessibilityRole={choice ? 'radio' : 'button'}
      accessibilityState={
        choice ? { selected, disabled: inactive } : { disabled: inactive }
      }
      accessibilityLabel={label}
      accessibilityHint={hint}
    >
      {Icon !== undefined && (
        <Icon
          size={ICON.row}
          color={selected ? '$primary' : '$mutedForeground'}
        />
      )}

      <YStack flex={1} gap={SPACING.text}>
        <SizableText
          size={TEXT.body}
          fontWeight={selected ? '600' : '400'}
          color="$cardForeground"
        >
          {label}
        </SizableText>
        {hint !== undefined && (
          <SizableText size={TEXT.caption} color="$mutedForeground">
            {hint}
          </SizableText>
        )}
      </YStack>

      {busy ? (
        <Spinner color="$mutedForeground" />
      ) : choice ? (
        <YStack width={ICON.row} items="center">
          {selected && <Check size={ICON.row} color="$primary" />}
        </YStack>
      ) : (
        TrailingIcon !== undefined && (
          <TrailingIcon size={ICON.row} color="$mutedForeground" />
        )
      )}
    </XStack>
  );
}
