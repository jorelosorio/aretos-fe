/**
 * The current week as seven cells, one per day, for the strip on the home
 * screen.
 *
 * The week runs Monday to Sunday because that is the week the server already
 * counts in — `periodStart` snaps a weekly goal to its Monday — so the strip
 * and a weekly goal's period start on the same day rather than a day apart.
 *
 * Seven days are always rendered, including the ones still to come. A week
 * that grew as it went would make Wednesday look like a full week with four
 * misses, which is the opposite of what the strip is for.
 */

import type { Goal } from '@/features/goals';
import type { Habit } from '@/features/habits';
import {
  dateKey,
  outcomeOf,
  periodKey,
  todayKey,
  type DateKey,
  type Log,
} from '@/features/logs';
const DAYS_IN_WEEK = 7;

/**
 * How well the period behind a day went.
 *
 * `logged` alone was too coarse: a day where one habit of four was met drew
 * the same full dot as a day where all four were, so a week of scraping by
 * looked identical to a perfect one. These four states are the least that
 * distinguishes them.
 *
 * `missed` and `none` stay apart for the same reason `outcomeOf` keeps
 * `missed` and `pending` apart — a period the person opened and met nothing
 * in is a different thing from one they never opened.
 */
export type DayStatus = 'complete' | 'partial' | 'missed' | 'none';

/**
 * No day letter rides along.
 *
 * The row is always Monday to Sunday and today is drawn larger than the rest,
 * so the position of a dot already says which day it is — and the letters cost
 * a whole line on a card that repeats once per goal. The week is named for
 * screen readers on the card instead, through `home.week.summary`.
 */
export type DayCell = {
  date: DateKey;
  status: DayStatus;
  /** The period this day belongs to has a saved log. */
  logged: boolean;
  isToday: boolean;
  isFuture: boolean;
};

function parse(key: DateKey): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Monday of the week containing today, which is where the strip starts. */
export function weekStart(): DateKey {
  return periodKey(todayKey(), 'weekly');
}

/**
 * Monday through Sunday of this week, which is the widest range any goal's
 * current period can touch — a daily goal needs each day and a weekly goal
 * needs the Monday. One request covers every goal on the screen.
 */
export function currentWeekWindow(): { from: DateKey; to: DateKey } {
  const monday = parse(weekStart());
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return { from: dateKey(monday), to: dateKey(sunday) };
}

/**
 * How much of a period's weight was actually met.
 *
 * Weighted rather than counted, because `weight` is the goal's own statement
 * of how much each habit matters — treating a weight-3 habit as one of four
 * would contradict what the person configured.
 *
 * Skipped habits leave the denominator: a period consciously passed on is not
 * a shortfall, and counting it as one would punish the person for using the
 * feature. A period where everything was skipped therefore has no measurable
 * weight at all, which `null` says and the caller reads as `missed` — nothing
 * was met, but nothing was neglected either.
 */
function metRatio(habits: readonly Habit[], log: Log): number | null {
  const entries = new Map(log.entries.map((entry) => [entry.habitId, entry]));

  let total = 0;
  let met = 0;

  for (const habit of habits) {
    const entry = entries.get(habit.id);
    const outcome = entry && outcomeOf(habit, entry);

    if (outcome === 'skipped') continue;

    total += habit.weight;
    if (outcome === 'done') met += habit.weight;
  }

  return total === 0 ? null : met / total;
}

function statusOf(habits: readonly Habit[], log: Log | undefined): DayStatus {
  if (log === undefined) return 'none';

  const ratio = metRatio(habits, log);
  if (ratio === null || ratio === 0) return 'missed';
  return ratio === 1 ? 'complete' : 'partial';
}

/**
 * How each day of the week went for this goal.
 *
 * A day takes the state of *its period*, not of a log falling on that date —
 * which is what makes the strip honest for a weekly goal. All seven of its
 * days map to the same Monday, so one saved week lights the whole row rather
 * than one square, because the person really did account for the week.
 */
export function weekCells(
  goal: Goal,
  habits: readonly Habit[],
  logs: readonly Log[],
): DayCell[] {
  const today = todayKey();
  const monday = parse(weekStart());

  const byPeriod = new Map(
    logs
      .filter((log) => log.goalId === goal.id)
      .map((log) => [log.entryDate, log]),
  );

  return Array.from({ length: DAYS_IN_WEEK }, (_, offset) => {
    const day = new Date(monday);
    day.setDate(day.getDate() + offset);
    const date = dateKey(day);

    const log = byPeriod.get(periodKey(date, goal.trackingFrequency));

    return {
      date,
      status: statusOf(habits, log),
      logged: log !== undefined,
      isToday: date === today,
      isFuture: date > today,
    };
  });
}
