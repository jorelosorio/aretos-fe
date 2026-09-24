import { YStack } from 'tamagui';

import { slotColor } from './slot-color';

export function GoalDot({ slot, size = 10 }: { slot: number; size?: number }) {
  return (
    <YStack
      width={size}
      height={size}
      rounded={size / 2}
      bg={slotColor(slot)}
      shrink={0}
    />
  );
}
