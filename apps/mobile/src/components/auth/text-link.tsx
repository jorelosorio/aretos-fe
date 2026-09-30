import { SizableText, XStack } from 'tamagui';

import { HIT_SLOP, TEXT } from '@/constants/layout';

export function TextLink({
  lead,
  label,
  onPress,
  disabled = false,
}: {
  lead?: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
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
        color={disabled ? '$mutedForeground' : '$primary'}
        onPress={disabled ? undefined : onPress}
        hitSlop={HIT_SLOP}
        accessibilityRole="link"
        accessibilityState={{ disabled }}
      >
        {label}
      </SizableText>
    </XStack>
  );
}
