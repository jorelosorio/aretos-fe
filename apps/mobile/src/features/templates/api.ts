import { api } from '@/lib/api/client';

import type {
  GoalExport,
  Template,
  TemplateHabit,
  TemplatePage,
  TemplatePatch,
  TemplateSearch,
  WireTemplate,
  WireTemplateHabit,
  WireTemplates,
} from './types';

/** Requests for the templates feature, mirroring `aretos-be/bruno/Templates/`. */
const paths = {
  templates: '/v1/templates',
  template: (id: string) => `/v1/templates/${id}`,
  use: (id: string) => `/v1/templates/${id}/use`,
  fromGoal: (goalId: string) => `/v1/goals/${goalId}/template`,
};

/**
 * The server's default page, repeated so a cache key names the size it was
 * filled at.
 */
export const TEMPLATE_PAGE_SIZE = 20;

/**
 * The shape a search takes in a cache key, and — nulls dropped — the query
 * params it turns into. Built once so a key and the request it stands for
 * cannot describe different things.
 *
 * `q` is trimmed here because the server trims it: `"run"` and `"run "` are
 * one search and should be one cache entry.
 */
export function searchParams(search: TemplateSearch) {
  const q = search.q?.trim() ?? '';

  return {
    q: q === '' ? null : q,
    scope: search.scope ?? null,
    language: search.language ?? null,
    limit: TEMPLATE_PAGE_SIZE,
  };
}

const toQuery = (params: Record<string, string | number | null>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== null),
  );

/** Query keys for this feature, as a factory so they cannot drift apart. */
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (search: TemplateSearch = {}) =>
    [...templateKeys.lists(), searchParams(search)] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
};

const toHabit = (wire: WireTemplateHabit): TemplateHabit => ({
  name: wire.name,
  trackingMode: wire.tracking_mode,
  weight: wire.weight,
  successThreshold: wire.success_threshold,
  ifThenPlan: wire.if_then_plan,
});

export const toTemplate = (wire: WireTemplate): Template => ({
  id: wire.id,
  name: wire.name,
  description: wire.description,
  language: wire.language,
  trackingFrequency: wire.tracking_frequency,
  streakRule: wire.streak_rule,
  streakThreshold: wire.streak_threshold,
  streakSkipLimit: wire.streak_skip_limit,
  active: wire.active,
  // Sorted rather than trusted: `position` is the order, and the response
  // happening to be in it today is not a promise.
  habits: [...wire.habits].sort((a, b) => a.position - b.position).map(toHabit),
  publisher: {
    name: wire.publisher.name,
    official: wire.publisher.official,
  },
  owned: wire.owned,
  review:
    wire.review === undefined
      ? null
      : {
          status: wire.review.status,
          note: wire.review.note,
          reviewedAt: wire.review.reviewed_at,
          shared: wire.review.shared,
        },
  uses: wire.uses,
  createdAt: wire.created_at,
  updatedAt: wire.updated_at,
});

/**
 * One habit as the server's `habitSettings` reads it. A threshold goes only
 * with a mode that measures something, as `features/habits` sends it.
 */
function toHabitBody(habit: TemplateHabit): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: habit.name.trim(),
    tracking_mode: habit.trackingMode,
    weight: habit.weight,
    if_then_plan: habit.ifThenPlan.trim(),
  };
  if (habit.trackingMode !== 'binary' && habit.successThreshold !== null) {
    body.success_threshold = habit.successThreshold;
  }
  return body;
}

/**
 * camelCase in, snake_case out, and a key the caller left out never reaches
 * the body — that absence is what makes a patch leave a field, and so the
 * review, alone.
 */
export function toBody(patch: TemplatePatch): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (patch.name !== undefined) body.name = patch.name.trim();
  if (patch.description !== undefined) {
    body.description = patch.description.trim();
  }
  if (patch.language !== undefined) body.language = patch.language;
  if (patch.trackingFrequency !== undefined) {
    body.tracking_frequency = patch.trackingFrequency;
  }
  if (patch.streakRule !== undefined) body.streak_rule = patch.streakRule;
  if (patch.streakThreshold !== undefined) {
    body.streak_threshold = patch.streakThreshold;
  }
  if (patch.streakSkipLimit !== undefined) {
    body.streak_skip_limit = patch.streakSkipLimit;
  }
  if (patch.habits !== undefined) body.habits = patch.habits.map(toHabitBody);
  if (patch.active !== undefined) body.active = patch.active;

  return body;
}

/**
 * One page of the templates the caller may see: official first, then the
 * most used. `offset` is the previous page's `nextOffset`; `0` is the first.
 */
export async function listTemplates(
  search: TemplateSearch,
  offset: number,
): Promise<TemplatePage> {
  const { data } = await api.get<WireTemplates>(paths.templates, {
    params: toQuery({
      ...searchParams(search),
      offset: offset === 0 ? null : offset,
    }),
  });
  return {
    templates: data.templates.map(toTemplate),
    nextOffset: data.next_offset,
  };
}

export async function getTemplate(id: string): Promise<Template> {
  const { data } = await api.get<WireTemplate>(paths.template(id));
  return toTemplate(data);
}

/**
 * Capped per plan. New templates start private and in review; sharing one is
 * a separate `{ active: true }`.
 */
export async function createTemplate(
  draft: TemplatePatch & Pick<Template, 'name' | 'language'>,
): Promise<Template> {
  const { data } = await api.post<WireTemplate>(paths.templates, toBody(draft));
  return toTemplate(data);
}

export async function updateTemplate(
  id: string,
  patch: TemplatePatch,
): Promise<Template> {
  const { data } = await api.patch<WireTemplate>(
    paths.template(id),
    toBody(patch),
  );
  return toTemplate(data);
}

/** Goals already started from it keep everything they were given. */
export async function deleteTemplate(id: string): Promise<void> {
  await api.delete(paths.template(id));
}

/**
 * Starts a goal of the caller's from the template, its habits included and
 * no tags. Answers with the new goal's id, which is all a caller needs to
 * open it: the goals feature reads it back itself.
 */
export async function startFromTemplate(id: string): Promise<string> {
  const { data } = await api.post<{ id: string }>(paths.use(id));
  return data.id;
}

/**
 * Turns one of the caller's goals into a template of theirs: its settings,
 * its active habits in order — not its tags, which are the owner's own. A
 * goal has no language of its own, so it is said here.
 */
export async function templateFromGoal(
  goalId: string,
  value: GoalExport,
): Promise<Template> {
  const name = value.name.trim();
  const { data } = await api.post<WireTemplate>(paths.fromGoal(goalId), {
    language: value.language,
    ...(name === '' ? {} : { name }),
  });
  return toTemplate(data);
}
