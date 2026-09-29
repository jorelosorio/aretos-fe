import { createGoal, getGoal } from '@/features/goals/api';
import { EMPTY_DRAFT as EMPTY_GOAL } from '@/features/goals/types';
import { createHabit } from '@/features/habits/api';
import { EMPTY_DRAFT as EMPTY_HABIT } from '@/features/habits/types';
import { saveLog } from '@/features/logs/api';
import { emptyEntry } from '@/features/logs/types';

import { chosenHabits } from './steps';
import type { GuideDraft, GuideProgress } from './types';

/**
 * Writes the whole guide: the goal, each habit in the order shown, then
 * today's check-in when at least one habit was marked.
 *
 * Nothing is written before this runs, so leaving the guide early leaves
 * no data behind. Each write that succeeds is recorded in `progress`, which
 * the caller keeps between attempts: after a failure, running this again
 * skips what already exists and carries on from the request that failed.
 *
 * The goal and habits take the full forms' defaults, apart from the goal's
 * name and colour; every habit is a plain yes or no. Which day "today" is comes from the server, as the
 * goal's current period, so the app computes no date of its own.
 *
 * Resolves to the goal's id.
 */
export async function completeGuide(
  draft: GuideDraft,
  progress: GuideProgress,
): Promise<string> {
  if (progress.goalId === null) {
    const goal = await createGoal({
      ...EMPTY_GOAL,
      name: draft.goalName.trim(),
      colorSlot: draft.colorSlot,
    });
    progress.goalId = goal.id;
  }
  const goalId = progress.goalId;
  const habits = chosenHabits(draft);

  for (const name of habits) {
    if (progress.habitIds[name] !== undefined) continue;
    const habit = await createHabit(goalId, { ...EMPTY_HABIT, name });
    progress.habitIds[name] = habit.id;
  }

  if (!progress.logged && draft.doneToday.length > 0) {
    const goal = await getGoal(goalId, { include: ['progress'] });
    const entryDate = goal.progress?.currentPeriod.entryDate;
    if (entryDate === undefined) {
      throw new Error('The new goal came back without its current period.');
    }

    await saveLog({
      goalId,
      entryDate,
      mood: null,
      entries: habits.map((name) => ({
        ...emptyEntry(progress.habitIds[name]),
        done: draft.doneToday.includes(name) ? true : null,
      })),
    });
    progress.logged = true;
  }

  return goalId;
}
