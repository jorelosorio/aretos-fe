import { api } from '@/lib/api';

import type { Goal, GoalDraft, GoalPatch, WireGoal, WireGoals } from './types';

/** Requests for the goals feature, mirroring `aretos-be/bruno/Goals/`. */
const paths = {
  goals: '/v1/goals',
  goal: (id: string) => `/v1/goals/${id}`,
};

/** Query keys for this feature, as a factory so they cannot drift apart. */
export const goalKeys = {
  all: ['goals'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
  /** `archived` is part of the key: each filter is its own cached list. */
  list: (archived?: boolean) => [...goalKeys.lists(), { archived }] as const,
  details: () => [...goalKeys.all, 'detail'] as const,
  detail: (id: string) => [...goalKeys.details(), id] as const,
};

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
 */
export async function listGoals(archived?: boolean): Promise<Goal[]> {
  const { data } = await api.get<WireGoals>(paths.goals, {
    params: archived === undefined ? undefined : { archived },
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
