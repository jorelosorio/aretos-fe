import { sameTags } from '@/features/tags';

import type { GoalDraft, GoalPatch } from './types';

/**
 * What an edit sends. Tags go only when they changed.
 *
 * The server replaces a goal's tags whole with whatever list arrives, so an
 * unchanged list resent is a write the person did not make — and it is not
 * harmless: any `tags` key counts as an edit, which an archived goal refuses.
 */
export function toGoalPatch(value: GoalDraft, initial: GoalDraft): GoalPatch {
  if (!sameTags(value.tags, initial.tags)) return value;

  const patch: GoalPatch = { ...value };
  delete patch.tags;
  return patch;
}
