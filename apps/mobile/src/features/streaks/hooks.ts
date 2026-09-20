import { useMemo } from 'react';

import { mockStreak } from './mock';
import type { StreakByGoal } from './types';

/**
 * Each goal's current streak.
 *
 * Takes the ids because the mock has no other way to know which goals to
 * answer for; a real `GET /v1/streaks` would ignore the argument or use it
 * only as a query key, so the call sites do not move when it arrives. Not a
 * `useQuery` today on purpose — a resolved-immediately query still renders
 * one pass with no data, and a streak that pops in after the card has drawn
 * looks like a bug.
 */
export function useGoalStreaks(goalIds: readonly string[]): StreakByGoal {
  const key = goalIds.join(',');

  return useMemo(() => {
    const entries = key === '' ? [] : key.split(',');
    return Object.fromEntries(entries.map((id) => [id, mockStreak(id)]));
  }, [key]);
}
