import { SizableText, XStack } from 'tamagui';

import { HIT_SLOP, TEXT } from '@/constants/layout';

export function TextLink({
  lead,
  label,
  onPress,
}: {
  lead?: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <XStack justify="center" gap="$1" flexWrap="wrap">
      {lead !== undefined && (
        <SizableText size={TEXT.body} color="$mutedForeground">
          {lead}
        </SizableText>
      )}
      <SizableText
        size={TEXT.body}
        fontWeight="700"
        color="$primary"
        onPress={onPress}
        hitSlop={HIT_SLOP}
        accessibilityRole="link"
      >
        {label}
      </SizableText>
    </XStack>
  );
}
