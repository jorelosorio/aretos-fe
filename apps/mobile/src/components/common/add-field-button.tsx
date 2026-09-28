import { Plus } from '@tamagui/lucide-icons-2/icons/Plus';
import { SizableText, XStack } from 'tamagui';

import { HIT_SLOP, ICON, TEXT } from '@/constants/layout';

export function AddFieldButton({
  label,
  accessibilityLabel,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <XStack
      items="center"
      gap="$1.5"
      px="$3"
      py="$2"
      rounded={999}
      bg="$card"
      pressStyle={{ bg: '$cardPress' }}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Plus size={ICON.inline} color="$primary" strokeWidth={3} />
      <SizableText size={TEXT.body} fontWeight="600" color="$color">
        {label}
      </SizableText>
    </XStack>
  );
}
