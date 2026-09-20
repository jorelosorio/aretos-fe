import { useTheme } from '@tamagui/core';
import { Target } from '@tamagui/lucide-icons-2';
import { Square, YStack } from 'tamagui';

import { resolveColor } from '@/components/common/theme-color';
import { slotColor } from '@/components/goals/slot-color';
import { MoodFace } from '@/components/logs/mood-face';
import { ICON } from '@/constants/layout';
import type { MoodScore } from '@/features/logs';

const MARK_SIZE = '$4';
const TINT_OPACITY = 0.16;

export function GoalMark({
  colorSlot,
  mood,
}: {
  colorSlot: number;
  mood?: MoodScore | null;
}) {
  const theme = useTheme();
  const tint = slotColor(colorSlot);

  return (
    <Square
      size={MARK_SIZE}
      items="center"
      justify="center"
      rounded="$xl"
      overflow="hidden"
    >
      <YStack
        position="absolute"
        t={0}
        l={0}
        r={0}
        b={0}
        bg={tint}
        opacity={TINT_OPACITY}
      />

      {mood == null ? (
        <Target size={ICON.feature} color={tint} />
      ) : (
        <MoodFace
          headOnly
          score={mood}
          size={ICON.feature}
          color={resolveColor(theme, tint)}
        />
      )}
    </Square>
  );
}
