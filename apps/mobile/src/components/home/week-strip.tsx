import { Check } from '@tamagui/lucide-icons-2';
import { Circle, XStack } from 'tamagui';

import { ICON } from '@/constants/layout';

import type { DayCell } from './week-days';

const DAY_SIZE = '$1';
const TODAY_SIZE = '$1.5';
const CORE_SIZE = '$0.75';

export function WeekStrip({ cells }: { cells: readonly DayCell[] }) {
  return (
    <XStack items="center" gap="$1.5">
      {cells.map((cell) => {
        const complete = cell.status === 'complete';
        const ringed = cell.status !== 'none' || cell.isToday;

        return (
          <Circle
            key={cell.date}
            size={cell.isToday ? TODAY_SIZE : DAY_SIZE}
            items="center"
            justify="center"
            bg={complete ? '$primary' : '$muted'}
            borderWidth={ringed && !complete ? 2 : 0}
            borderColor={
              cell.status === 'missed' ? '$outcomeMissed' : '$primary'
            }
            opacity={cell.isFuture && !cell.logged ? 0.4 : 1}
          >
            {complete && (
              <Check
                size={ICON.inline}
                color="$primaryForeground"
                strokeWidth={3}
              />
            )}

            {cell.status === 'partial' && (
              <Circle size={CORE_SIZE} bg="$primary" />
            )}
          </Circle>
        );
      })}
    </XStack>
  );
}
