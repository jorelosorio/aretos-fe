/**
 * Where each goal stands in the period it is currently in.
 *
 * Assembled on the device from three lists the app already holds rather than
 * fetched, because the API has no progress endpoint: goals, habits and logs
 * are all the server offers, and this is the most the home screen can honestly
 * say without inventing analysis the backend does not do.
 *
 * The awkward part is that "now" is not one period. A daily goal's period is
 * today and a weekly goal's is the week, so two goals looked at in the same
 * second are asking about different `entry_date`s — which is why each goal
 * snaps its own and the log is matched per goal rather than by date alone.
 */

import type { Goal } from '@/features/goals';
import type { Habit } from '@/features/habits';
import {
  isAnswered,
  periodKey,
  todayKey,
  type DateKey,
  type Log,
} from '@/features/logs';

export type GoalStatus = {
  goal: Goal;
  /** The period this goal is in right now, already snapped to its first day. */
  entryDate: DateKey;
  habits: Habit[];
  /** The saved log for that period, or `undefined` while it is unwritten. */
  log: Log | undefined;
  /** This goal's logs across the whole week, which is what the strip draws. */
  weekLogs: Log[];
  /** How many of the goal's habits this period has an answer for. */
  answered: number;
  total: number;
};

export function toGoalStatus(
  goals: readonly Goal[],
  habits: readonly Habit[],
  logs: readonly Log[],
): GoalStatus[] {
  return goals.map((goal) => {
    const entryDate = periodKey(todayKey(), goal.trackingFrequency);
    const weekLogs = logs.filter((log) => log.goalId === goal.id);
    const log = weekLogs.find((candidate) => candidate.entryDate === entryDate);

    const owned = habits.filter((habit) => habit.goalId === goal.id);
    const entries = new Map(log?.entries.map((e) => [e.habitId, e]) ?? []);

    // Counted over the goal's habits, not over the log's entries: an entry
    // left behind by a since-archived habit is still stored on the period but
    // is no longer something the person can answer, so counting it would show
    // "3 of 2".
    const answered = owned.filter((habit) => {
      const entry = entries.get(habit.id);
      return entry !== undefined && isAnswered(entry);
    }).length;

    return {
      goal,
      entryDate,
      habits: owned,
      log,
      weekLogs,
      answered,
      total: owned.length,
    };
  });
}
