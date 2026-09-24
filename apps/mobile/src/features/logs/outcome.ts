/**
 * How one entry reads at a glance: done, missed, skipped, or nothing said yet.
 *
 * The rule for "done" is the server's. A saved answer comes back already
 * judged (`PeriodEntry.achieved`), but the check-in shows the verdict while an
 * answer is still being typed, before there is anything saved to judge. So
 * the server sends each habit's bar as data — `achievedWhen`, which is
 * `progress.CriterionOf`, the same value `progress.Achieved` applies — and
 * this only compares the typed answer against it. It used to keep its own
 * copy of the rule, and the copy had drifted: it counted a 0 as done for a
 * measured habit with no threshold, which the server never has.
 *
 * `missed` and `pending` are deliberately different: both leave the habit
 * unmet, but only one of them is a thing the person actually said.
 */

import type { Habit } from '@/features/habits';

import { isAnswered, type LogEntry } from './types';

export type Outcome = 'done' | 'missed' | 'skipped' | 'pending';

/** Whether the entry clears the bar the server sent for its habit. */
function metTarget(habit: Habit, entry: LogEntry): boolean {
  const { compare, value } = habit.achievedWhen;

  switch (compare) {
    case 'true':
      return entry.done === true;
    case 'at_least':
      return entry.amount !== null && value !== null && entry.amount >= value;
    case 'above':
      return entry.amount !== null && value !== null && entry.amount > value;
  }
}

export function outcomeOf(habit: Habit, entry: LogEntry): Outcome {
  if (entry.skipped) return 'skipped';
  if (!isAnswered(entry)) return 'pending';
  return metTarget(habit, entry) ? 'done' : 'missed';
}

/**
 * The theme's own names for these four states.
 *
 * `themes.ts` carries `outcomeDone`, `outcomeMissed`, `outcomeSkipped` and
 * `outcomeBlank` already — they came over with the design system — so the
 * mapping belongs next to the states rather than being re-picked per screen.
 *
 * `satisfies` rather than an annotation, for the same reason `slotColor` is
 * left inferred: annotating this `string` widens the values and Tamagui only
 * accepts its own token literals.
 */
export const OUTCOME_COLORS = {
  done: '$outcomeDone',
  missed: '$outcomeMissed',
  skipped: '$outcomeSkipped',
  pending: '$outcomeBlank',
} as const satisfies Record<Outcome, string>;
