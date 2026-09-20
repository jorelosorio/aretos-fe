import { api } from '@/lib/api';
import { deviceTimezone } from '@/lib/timezone';

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
 * What a list request asks the server for beyond the goals themselves.
 *
 * `tz` is filled in from the device unless a caller names one; it only
 * matters alongside `include: 'progress'`, which is the read whose "today"
 * depends on it.
 */
export type ListGoalsOptions = {
  archived?: boolean;
  include?: GoalInclude;
  tz?: string;
};

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
      {
        archived: options.archived,
        include: options.include ?? null,
        tz: options.tz ?? null,
      },
    ] as const,
  details: () => [...goalKeys.all, 'detail'] as const,
  detail: (id: string) => [...goalKeys.details(), id] as const,
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
  // Left undefined rather than defaulted: the block is absent when it was
  // not asked for, and that is not the same as a goal with no history.
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
  const { archived, include } = options;
  const tz = options.tz ?? deviceTimezone();

  const { data } = await api.get<WireGoals>(paths.goals, {
    params: {
      ...(archived === undefined ? {} : { archived }),
      ...(include === undefined ? {} : { include }),
      // Only meaningful with progress, and omitted otherwise so a plain list
      // keeps the one cache entry it has always had.
      ...(include === undefined || tz === undefined ? {} : { tz }),
    },
  });
  return data.goals.map(toGoal);
}

export async function getGoal(id: string): Promise<Goal> {
  const { data } = await api.get<WireGoal>(paths.goal(id));
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
