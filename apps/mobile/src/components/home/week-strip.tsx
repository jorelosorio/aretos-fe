import { Check } from '@tamagui/lucide-icons-2';
import { XStack, YStack } from 'tamagui';

import type { Goal } from '@/features/goals';
import type { Log } from '@/features/logs';

import { weekCells } from './week-days';

const DOT_SIZE = 14;
const TODAY_SIZE = 20;

export function WeekStrip({
  goal,
  logs,
}: {
  goal: Goal;
  logs: readonly Log[];
}) {
  const cells = weekCells(goal, logs);

  return (
    <XStack items="center" gap="$1.5">
      {cells.map((cell) => {
        const size = cell.isToday ? TODAY_SIZE : DOT_SIZE;

        return (
          <YStack
            key={cell.date}
            width={size}
            height={size}
            items="center"
            justify="center"
            rounded={size / 2}
            bg={cell.logged ? '$primary' : '$muted'}
            borderWidth={cell.isToday && !cell.logged ? 2 : 0}
            borderColor="$primary"
            opacity={cell.isFuture && !cell.logged ? 0.4 : 1}
          >
            {cell.logged && (
              <Check size={cell.isToday ? 13 : 9} color="$primaryForeground" />
            )}
          </YStack>
        );
      })}
    </XStack>
  );
}
