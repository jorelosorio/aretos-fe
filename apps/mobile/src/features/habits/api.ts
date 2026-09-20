import { api } from '@/lib/api';

import type {
  Habit,
  HabitDraft,
  HabitPatch,
  WireHabit,
  WireHabits,
} from './types';
import { hasThreshold } from './types';

const paths = {
  habits: '/v1/habits',
  habit: (id: string) => `/v1/habits/${id}`,
};

export const habitKeys = {
  all: ['habits'] as const,
  lists: () => [...habitKeys.all, 'list'] as const,
  list: (goalId: string | undefined, archived?: boolean) =>
    [...habitKeys.lists(), goalId ?? 'all', { archived }] as const,
  details: () => [...habitKeys.all, 'detail'] as const,
  detail: (id: string) => [...habitKeys.details(), id] as const,
};

/**
 * Shared with `features/goals`, which maps the same rows out of a goal's
 * `?include=habits` block. One mapper so the two cannot drift.
 */
export const toHabit = (wire: WireHabit): Habit => ({
  id: wire.id,
  goalId: wire.goal_id,
  name: wire.name,
  trackingMode: wire.tracking_mode,
  weight: wire.weight,
  successThreshold: wire.success_threshold,
  ifThenPlan: wire.if_then_plan,
  archived: wire.archived,
  createdAt: wire.created_at,
  updatedAt: wire.updated_at,
});

/**
 * camelCase in, snake_case out, dropping keys the caller left out.
 *
 * `success_threshold` is omitted for a mode that has no target. The column is
 * updated through `COALESCE(sqlc.narg(...), success_threshold)`, so sending
 * `null` would not clear it anyway — a stale value simply stops being read.
 */
function toBody(patch: HabitPatch): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (patch.name !== undefined) body.name = patch.name.trim();
  if (patch.trackingMode !== undefined) {
    body.tracking_mode = patch.trackingMode;
  }
  if (patch.weight !== undefined) body.weight = patch.weight;
  if (patch.ifThenPlan !== undefined) {
    body.if_then_plan = patch.ifThenPlan.trim();
  }
  if (patch.archived !== undefined) body.archived = patch.archived;

  const keepsThreshold =
    patch.trackingMode === undefined || hasThreshold(patch.trackingMode);
  if (keepsThreshold && patch.successThreshold != null) {
    body.success_threshold = patch.successThreshold;
  }

  return body;
}

/**
 * Habits, oldest first. Scoped to one goal, or every habit the user owns when
 * `goalId` is omitted — which is how the goals list counts each goal's
 * actions in one request instead of one per row.
 */
export async function listHabits(
  goalId?: string,
  archived?: boolean,
): Promise<Habit[]> {
  const { data } = await api.get<WireHabits>(paths.habits, {
    params: {
      ...(goalId === undefined ? {} : { goal_id: goalId }),
      ...(archived === undefined ? {} : { archived }),
    },
  });
  return data.habits.map(toHabit);
}

export async function getHabit(id: string): Promise<Habit> {
  const { data } = await api.get<WireHabit>(paths.habit(id));
  return toHabit(data);
}

/** The goal must exist and be the caller's, or this answers 404. */
export async function createHabit(
  goalId: string,
  draft: HabitDraft,
): Promise<Habit> {
  const { data } = await api.post<WireHabit>(paths.habits, {
    goal_id: goalId,
    ...toBody(draft),
  });
  return toHabit(data);
}

export async function updateHabit(
  id: string,
  patch: HabitPatch,
): Promise<Habit> {
  const { data } = await api.patch<WireHabit>(paths.habit(id), toBody(patch));
  return toHabit(data);
}

export async function deleteHabit(id: string): Promise<void> {
  await api.delete(paths.habit(id));
}
