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
import {
  dateKey,
  periodKey,
  todayKey,
  type DateKey,
  type Log,
} from '@/features/logs';
const DAYS_IN_WEEK = 7;

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
 * Whether each day of the week has been logged for this goal.
 *
 * A day is "logged" when *its period* has a log, not when a log falls on that
 * date — which is what makes the strip honest for a weekly goal. All seven of
 * its days map to the same Monday, so one saved week lights the whole row
 * rather than one square, because the person really did account for the week.
 */
export function weekCells(goal: Goal, logs: readonly Log[]): DayCell[] {
  const today = todayKey();
  const monday = parse(weekStart());

  const logged = new Set(
    logs.filter((log) => log.goalId === goal.id).map((log) => log.entryDate),
  );

  return Array.from({ length: DAYS_IN_WEEK }, (_, offset) => {
    const day = new Date(monday);
    day.setDate(day.getDate() + offset);
    const date = dateKey(day);

    return {
      date,
      logged: logged.has(periodKey(date, goal.trackingFrequency)),
      isToday: date === today,
      isFuture: date > today,
    };
  });
}
