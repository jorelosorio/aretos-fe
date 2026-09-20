import { api } from '@/lib/api';
import { deviceTimezone } from '@/lib/timezone';

import { toHabit } from '@/features/habits';
import type { MoodScore } from '@/features/logs';

import type {
  Goal,
  GoalDraft,
  GoalInclude,
  GoalPatch,
  GoalPeriod,
  GoalProgress,
  WireGoal,
  WireGoalPeriod,
  WireGoalProgress,
  WireGoals,
} from './types';

/** Requests for the goals feature, mirroring `aretos-be/bruno/Goals/`. */
const paths = {
  goals: '/v1/goals',
  goal: (id: string) => `/v1/goals/${id}`,
};

/**
 * What a read asks the server for beyond the goal rows themselves.
 *
 * `tz` is filled in from the device unless a caller names one; it only
 * matters alongside `include: ['progress']`, which is the read whose "today"
 * depends on it.
 *
 * `from`/`to` narrow the progress window. Left out, the server answers for
 * the current week in the resolved zone, which is what the home screen wants
 * and what saves it computing a "today" the server is the authority on.
 */
export type GoalReadOptions = {
  include?: readonly GoalInclude[];
  tz?: string;
  from?: string;
  to?: string;
};

export type ListGoalsOptions = GoalReadOptions & { archived?: boolean };

/**
 * The query params these options turn into, and the shape they take in a
 * cache key — built once so a key and the request it stands for cannot
 * describe different things.
 */
function readParams(options: GoalReadOptions) {
  const include =
    options.include === undefined || options.include.length === 0
      ? undefined
      : [...options.include].sort().join(',');

  // Only sent with progress: a plain read has no "today" in it, and passing
  // the zone anyway would split its cache entry per traveller for nothing.
  const wantsToday = include?.includes('progress') ?? false;
  const tz = wantsToday ? (options.tz ?? deviceTimezone()) : undefined;

  return {
    include: include ?? null,
    tz: tz ?? null,
    from: options.from ?? null,
    to: options.to ?? null,
  };
}

/** Drops the nulls `readParams` uses for cache keys; axios omits the rest. */
const toQuery = (params: Record<string, string | boolean | null>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== null),
  );

/** Query keys for this feature, as a factory so they cannot drift apart. */
export const goalKeys = {
  all: ['goals'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
  /**
   * Every option is part of the key: a list with progress and one without
   * are different responses, and caching them together would hand a screen
   * that asked for progress a row that has none.
   */
  list: (options: ListGoalsOptions = {}) =>
    [
      ...goalKeys.lists(),
      { archived: options.archived ?? null, ...readParams(options) },
    ] as const,
  details: () => [...goalKeys.all, 'detail'] as const,
  detail: (id: string, options: GoalReadOptions = {}) =>
    [...goalKeys.details(), id, readParams(options)] as const,
};

/**
 * Anything outside 1-5 reads as no answer, the same rule `features/logs`
 * applies to the column this comes from.
 */
function toMood(value: number | null): MoodScore | null {
  if (value === null) return null;
  return value >= 1 && value <= 5 ? (value as MoodScore) : null;
}

const toPeriod = (wire: WireGoalPeriod): GoalPeriod => ({
  entryDate: wire.entry_date,
  // The server sends "" for a period with no log; null is what the rest of
  // the app means by "there is nothing to amend".
  logId: wire.log_id === '' ? null : wire.log_id,
  logged: wire.logged,
  answered: wire.answered,
  skipped: wire.skipped,
  total: wire.total,
  completion: wire.completion,
  status: wire.status,
  countsForStreak: wire.counts_for_streak,
  note: wire.note,
  mood: toMood(wire.mood),
  entries: wire.entries.map((entry) => ({
    habitId: entry.habit_id,
    skipped: entry.skipped,
    done: entry.bool_value,
    amount: entry.num_value,
    achieved: entry.achieved,
  })),
});

const toProgress = (wire: WireGoalProgress): GoalProgress => ({
  timezone: wire.timezone,
  today: wire.today,
  from: wire.from,
  to: wire.to,
  currentStreak: wire.current_streak,
  longestStreak: wire.longest_streak,
  pending: wire.pending,
  lastEntryDate: wire.last_entry_date === '' ? null : wire.last_entry_date,
  currentPeriod: toPeriod(wire.current_period),
  periods: wire.periods.map(toPeriod),
});

const toGoal = (wire: WireGoal): Goal => ({
  id: wire.id,
  name: wire.name,
  description: wire.description,
  trackingFrequency: wire.tracking_frequency,
  streakRule: wire.streak_rule,
  streakThreshold: wire.streak_threshold,
  colorSlot: wire.color_slot,
  archived: wire.archived,
  createdAt: wire.created_at,
  updatedAt: wire.updated_at,
  habitCount: wire.habit_count,
  // Left undefined rather than defaulted: a block is absent when it was not
  // asked for, and that is not the same as a goal with no habits or no
  // history — a screen that did not ask must not read the gap as an answer.
  habits: wire.habits === undefined ? undefined : wire.habits.map(toHabit),
  progress: wire.progress === undefined ? undefined : toProgress(wire.progress),
});

/**
 * camelCase in, snake_case out, and a key the caller left out never reaches
 * the body — that absence is what makes a patch leave a column alone.
 */
function toBody(patch: GoalPatch): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  // Trimmed here rather than in the form: every caller wants it, and the
  // server's `max=120` counts the whitespace it would otherwise store.
  if (patch.name !== undefined) body.name = patch.name.trim();
  if (patch.description !== undefined) {
    body.description = patch.description.trim();
  }
  if (patch.trackingFrequency !== undefined) {
    body.tracking_frequency = patch.trackingFrequency;
  }
  if (patch.streakRule !== undefined) body.streak_rule = patch.streakRule;
  if (patch.streakThreshold !== undefined) {
    body.streak_threshold = patch.streakThreshold;
  }
  if (patch.archived !== undefined) body.archived = patch.archived;

  return body;
}

/**
 * The user's goals, in `color_slot` order.
 *
 * Leaving `archived` out is a third state, not a default: the server then
 * returns active and archived together.
 *
 * With `include: 'progress'` each goal carries its scored calendar for the
 * current week — no `from`/`to` is sent, because the server's default window
 * is already Monday to Sunday in the resolved zone, and naming the dates here
 * would mean computing them from a "today" the server is the authority on.
 */
export async function listGoals(
  options: ListGoalsOptions = {},
): Promise<Goal[]> {
  const { data } = await api.get<WireGoals>(paths.goals, {
    params: toQuery({
      archived: options.archived ?? null,
      ...readParams(options),
    }),
  });
  return data.goals.map(toGoal);
}

/**
 * One goal, optionally with its habits and its scored calendar.
 *
 * `include: ['habits', 'progress']` with a one-period window is what makes
 * the check-in a single request: the habits to render, and the period's saved
 * answers, note and mood, in the response that also carries the goal.
 */
export async function getGoal(
  id: string,
  options: GoalReadOptions = {},
): Promise<Goal> {
  const { data } = await api.get<WireGoal>(paths.goal(id), {
    params: toQuery(readParams(options)),
  });
  return toGoal(data);
}

/** Capped per tier: the second goal on a free account answers 403. */
export async function createGoal(draft: GoalDraft): Promise<Goal> {
  const { data } = await api.post<WireGoal>(paths.goals, toBody(draft));
  return toGoal(data);
}

export async function updateGoal(id: string, patch: GoalPatch): Promise<Goal> {
  const { data } = await api.patch<WireGoal>(paths.goal(id), toBody(patch));
  return toGoal(data);
}

/**
 * Permanent, and it takes the goal's habits and habit logs with it. Prefer
 * `updateGoal(id, { archived: true })` when the user may want it back.
 */
export async function deleteGoal(id: string): Promise<void> {
  await api.delete(paths.goal(id));
}
