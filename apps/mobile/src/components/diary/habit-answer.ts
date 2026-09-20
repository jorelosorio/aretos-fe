/**
 * How one habit's answer reads on a diary card.
 *
 * Deliberately weaker than `logs/outcome.ts`, and the difference is the whole
 * point. That file can say `done` or `missed` for a measured habit because it
 * holds the `Habit` and so its `successThreshold` — the bar to compare the
 * value against. The diary's answers do not carry one, and they do not carry
 * `weight` either, because scoring a period is the goal's business and
 * `/v1/goals?include=progress` is what applies its rules.
 *
 * So a logged number gets `logged` and not a verdict. Drawing it as met or
 * missed here would mean guessing at a threshold this screen was not given,
 * and guessing wrong is worse than saying less: it would tell someone they
 * failed a habit they hit.
 *
 * `binary` is the exception and is honest: `bool_value` *is* the answer, with
 * no threshold in between, so it can be called done or not done outright.
 */

import type { DiaryHabitAnswer } from '@/features/diary';
import type { TranslationKey } from '@/lib/i18n';

export type AnswerMark = 'done' | 'notDone' | 'skipped' | 'logged' | 'pending';

export function markOf(answer: DiaryHabitAnswer): AnswerMark {
  if (answer.skipped) return 'skipped';
  if (answer.done !== null) return answer.done ? 'done' : 'notDone';
  if (answer.amount !== null) return 'logged';
  return 'pending';
}

/**
 * `satisfies` rather than an annotation, for the reason `slotColor` is left
 * inferred: annotating this `string` widens the values and Tamagui only
 * accepts its own token literals.
 *
 * `logged` takes the neutral ink rather than a success colour — it is a value
 * recorded, not a bar cleared.
 */
export const MARK_COLORS = {
  done: '$outcomeDone',
  notDone: '$outcomeMissed',
  skipped: '$outcomeSkipped',
  logged: '$primary',
  pending: '$outcomeBlank',
} as const satisfies Record<AnswerMark, string>;

/** For the screen reader, which gets no colour and no glyph. */
export const MARK_LABELS: Record<AnswerMark, TranslationKey> = {
  done: 'diary.answer.done',
  notDone: 'diary.answer.notDone',
  skipped: 'diary.answer.skipped',
  logged: 'diary.answer.logged',
  pending: 'diary.answer.pending',
};
