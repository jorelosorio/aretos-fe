import { Tag, X } from '@tamagui/lucide-icons-2';
import { SizableText, XStack, YStack } from 'tamagui';

import { ICON, TEXT } from '@/constants/layout';

const HIT_SLOP = 8;

export function TagChip({
  label,
  size = 'small',
  icon = true,
  selected,
  highlighted = false,
  onPress,
  accessibilityLabel,
  onRemove,
  removeLabel,
}: {
  label: string;
  size?: 'small' | 'regular';
  icon?: boolean;
  selected?: boolean;
  highlighted?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  onRemove?: () => void;
  removeLabel?: string;
}) {
  const active = selected === true || highlighted;
  const text = active ? '$primaryForeground' : '$color';
  const mark = active ? '$primaryForeground' : '$mutedForeground';

  return (
    <XStack
      items="center"
      gap="$1"
      pl="$2"
      pr={onRemove === undefined ? '$2.5' : '$1.5'}
      py="$1"
      rounded={999}
      bg={active ? '$primary' : '$muted'}
      onPress={onPress}
      pressStyle={onPress === undefined ? undefined : { opacity: 0.7 }}
      accessibilityRole={onPress === undefined ? 'text' : 'button'}
      accessibilityState={selected === undefined ? undefined : { selected }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {icon && <Tag size={ICON.inline} color={mark} />}
      <SizableText
        size={size === 'small' ? TEXT.caption : TEXT.body}
        color={text}
        numberOfLines={1}
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
