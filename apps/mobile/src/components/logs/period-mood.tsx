import { useTheme } from '@tamagui/core';

import { resolveColor } from '@/components/common/theme-color';
import { MoodBlank, MoodFace } from './mood-face';
import type { MoodScore } from '@/features/logs';

export function PeriodMood({
  mood,
  size,
  active = false,
}: {
  mood: MoodScore | null;
  size: number;
  active?: boolean;
}) {
  const theme = useTheme();

  if (mood === null) {
    return <MoodBlank size={size} color={resolveColor(theme, '$vizAxis')} />;
  }

  return (
    <MoodFace
      score={mood}
      size={size}
      color={resolveColor(theme, active ? '$color' : '$mutedForeground')}
    />
  );
}
