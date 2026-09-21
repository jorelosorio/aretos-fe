/**
 * Which period a date falls in, worked out on the device.
 *
 * Two reasons this cannot be left to the server. `entry_date` is required on
 * every save because the server has no timezone for the user and will not
 * guess which day it is. And the journal comes back keyed by the period's
 * first day, so to ask "is today's period already logged?" the app has to snap
 * a date the same way the server does before it can match one.
 *
 * `periodStart` in `internal/api/v1/habit_log_service.go` is the original;
 * these functions are its counterpart and have to agree with it exactly.
 */

import type { TrackingFrequency } from '@/features/goals';

/** A `YYYY-MM-DD` day, which is how every date crosses the wire. */
export type DateKey = string;

const pad = (value: number) => String(value).padStart(2, '0');

/** A local calendar date as `YYYY-MM-DD` — never `toISOString`, which is UTC. */
export function dateKey(date: Date): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Today where the user is, which is the only place "today" means anything. */
export function todayKey(): DateKey {
  return dateKey(new Date());
}

/**
 * Parsed as a local date, not as an instant.
 *
 * `new Date('2026-03-01')` is UTC midnight by spec, which in any negative
 * offset is still February 28th locally — a whole day of logs filed under the
 * wrong date. The parts have to be handed over separately.
 */
function fromDateKey(key: DateKey): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * The first day of the period this date belongs to.
 *
 * `daily` and `flexible` each stand on their own date. `weekly` snaps back to
 * Monday — the ISO week Postgres itself counts in — which is what makes a
 * Wednesday and a Friday of the same week one log rather than two.
 */
export function periodKey(key: DateKey, frequency: TrackingFrequency): DateKey {
  if (frequency !== 'weekly') return key;

  const date = fromDateKey(key);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return dateKey(date);
}

/** Moves by whole periods, for a check-in stepping back to yesterday. */
export function shiftPeriod(
  key: DateKey,
  frequency: TrackingFrequency,
  periods: number,
): DateKey {
  const date = fromDateKey(periodKey(key, frequency));
  date.setDate(date.getDate() + periods * (frequency === 'weekly' ? 7 : 1));
  return dateKey(date);
}

/**
 * Which day of its week a date is, counting Monday as 0.
 *
 * `getDay()` counts from Sunday, so using it directly would put Sunday at the
 * head of the week the check-in draws and on the far side of the boundary
 * `periodKey` snaps to — the two would disagree about which week a Sunday is
 * in.
 */
export function weekdayIndex(key: DateKey): number {
  return (fromDateKey(key).getDay() + 6) % 7;
}

/**
 * The seven days of the week a date falls in, Monday first.
 *
 * Built from the calendar rather than from what the server answered, because
 * the check-in's strip draws a cell per day either way: while a week's
 * periods are still loading the dates are already right, and the statuses
 * simply find nothing to attach to.
 */
export function weekDays(key: DateKey): DateKey[] {
  const monday = fromDateKey(periodKey(key, 'weekly'));

  return Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(monday);
    day.setDate(day.getDate() + offset);
    return dateKey(day);
  });
}

/** The Sunday that closes the week — the `to` of the check-in's read. */
export function weekEnd(key: DateKey): DateKey {
  return weekDays(key)[6];
}
