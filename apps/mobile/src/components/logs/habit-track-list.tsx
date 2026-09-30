import { Fragment } from 'react';
import { YStack } from 'tamagui';

import type { Habit } from '@/features/habits/types';
import type { LogEntry } from '@/features/logs/types';

import { HabitTrackRow } from './habit-track-row';
import type { EntryPatch } from './entry-value-input';
import { OutcomeRailGap } from './outcome-rail';

export function HabitTrackList({
  habits,
  entryFor,
  onChange,
  onToggleSkip,
}: {
  habits: readonly Habit[];
  entryFor: (habitId: string) => LogEntry;
  onChange: (habitId: string, patch: EntryPatch) => void;
  onToggleSkip: (habitId: string) => void;
}) {
  return (
    <YStack>
      {habits.map((habit, position) => (
        <Fragment key={habit.id}>
          {position > 0 && <OutcomeRailGap />}
          <HabitTrackRow
            habit={habit}
            entry={entryFor(habit.id)}
            isFirst={position === 0}
            isLast={position === habits.length - 1}
            onChange={(patch) => onChange(habit.id, patch)}
            onToggleSkip={() => onToggleSkip(habit.id)}
          />
        </Fragment>
      ))}
    </YStack>
  );
}
