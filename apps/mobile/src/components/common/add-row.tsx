import { Plus } from '@tamagui/lucide-icons-2';
import { Circle, SizableText, XStack } from 'tamagui';

import { ICON, SPACING, TEXT } from '@/constants/layout';

export function AddRow({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <XStack
      onPress={onPress}
      pressStyle={{ bg: '$muted' }}
      items="center"
      gap={SPACING.items}
      p={SPACING.card}
      rounded="$xl2"
      borderWidth={1}
      borderStyle="dashed"
      borderColor="$border"
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Circle size="$2" items="center" justify="center" bg="$accentSurface">
        <Plus size={ICON.row} color="$primary" />
      </Circle>

      <SizableText size={TEXT.body} fontWeight="600" color="$primary">
        {label}
      </SizableText>
    </XStack>
  );
}
