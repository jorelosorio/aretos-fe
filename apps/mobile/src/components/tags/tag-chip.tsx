import { Tag, X } from '@tamagui/lucide-icons-2';
import { SizableText, XStack, YStack } from 'tamagui';

import { ICON, TEXT } from '@/constants/layout';

const HIT_SLOP = 8;

export function TagChip({
  label,
  size = 'small',
  highlighted = false,
  onPress,
  accessibilityLabel,
  onRemove,
  removeLabel,
}: {
  label: string;
  size?: 'small' | 'regular';
  highlighted?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  onRemove?: () => void;
  removeLabel?: string;
}) {
  const text = highlighted ? '$primaryForeground' : '$color';
  const mark = highlighted ? '$primaryForeground' : '$mutedForeground';

  return (
    <XStack
      items="center"
      gap="$1"
      pl="$2"
      pr={onRemove === undefined ? '$2.5' : '$1.5'}
      py="$1"
      rounded={999}
      bg={highlighted ? '$primary' : '$muted'}
      onPress={onPress}
      pressStyle={onPress === undefined ? undefined : { opacity: 0.7 }}
      accessibilityRole={onPress === undefined ? 'text' : 'button'}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Tag size={ICON.inline} color={mark} />
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
