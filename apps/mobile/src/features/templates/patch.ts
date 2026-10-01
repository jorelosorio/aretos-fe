import { sameTags } from '@/features/tags/rules';

import type { TemplateDraft, TemplateHabit, TemplatePatch } from './types';

const sameHabit = (a: TemplateHabit, b: TemplateHabit) =>
  a.name.trim() === b.name.trim() &&
  a.trackingMode === b.trackingMode &&
  a.weight === b.weight &&
  a.successThreshold === b.successThreshold &&
  a.ifThenPlan.trim() === b.ifThenPlan.trim();

/** Same habits in the same order — the order is what a goal lists them in. */
export const sameHabits = (
  a: readonly TemplateHabit[],
  b: readonly TemplateHabit[],
) => a.length === b.length && a.every((habit, i) => sameHabit(habit, b[i]));

/**
 * What an edit sends: only the fields that changed.
 *
 * More than tidiness. Any key but `active` is an edit to the server, and an
 * edit sends the template back to review — so resending an unchanged field
 * would quietly unshare a template its author only opened and saved.
 */
export function toTemplatePatch(
  value: TemplateDraft,
  initial: TemplateDraft,
): TemplatePatch {
  const patch: TemplatePatch = {};

  if (value.name.trim() !== initial.name.trim()) patch.name = value.name;
  if (value.description.trim() !== initial.description.trim()) {
    patch.description = value.description;
  }
  if (value.language !== initial.language) patch.language = value.language;
  if (value.trackingFrequency !== initial.trackingFrequency) {
    patch.trackingFrequency = value.trackingFrequency;
  }
  if (value.streakRule !== initial.streakRule) {
    patch.streakRule = value.streakRule;
  }
  if (value.streakThreshold !== initial.streakThreshold) {
    patch.streakThreshold = value.streakThreshold;
  }
  if (value.streakSkipLimit !== initial.streakSkipLimit) {
    patch.streakSkipLimit = value.streakSkipLimit;
  }
  if (!sameTags(value.tags, initial.tags)) patch.tags = value.tags;
  if (!sameHabits(value.habits, initial.habits)) patch.habits = value.habits;

  return patch;
}
