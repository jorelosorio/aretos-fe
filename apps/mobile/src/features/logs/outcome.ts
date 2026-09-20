/**
 * How one entry reads at a glance: done, missed, skipped, or nothing said yet.
 *
 * This is presentation, not measurement. The server does not report whether an
 * entry met its habit's bar — `success_threshold` and the logged value both
 * come down raw — so the comparison happens here, the same way the web app
 * does it. Nothing is stored from it and nothing is sent back; it decides a
 * colour and a label, and the real accounting stays the server's when it
 * eventually grows an analysis endpoint.
 *
 * `missed` and `pending` are deliberately different: both leave the habit
 * unmet, but only one of them is a thing the person actually said.
 */

import type { Habit } from '@/features/habits';

import { isAnswered, type LogEntry } from './types';

export type Outcome = 'done' | 'missed' | 'skipped' | 'pending';

/**
 * Whether the entry cleared the habit's own bar.
 *
 * A `binary` habit has no threshold — doing it is the bar. For the measured
 * modes a habit with no threshold set counts any logged value as clearing it,
 * because the person never named a number to fall short of.
 */
function metTarget(habit: Habit, entry: LogEntry): boolean {
  if (habit.trackingMode === 'binary') return entry.done === true;
  if (entry.amount === null) return false;
  return (
    habit.successThreshold === null || entry.amount >= habit.successThreshold
  );
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
