import { useCallback } from 'react';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';

import { goalKeys } from '@/features/goals/api';
import { habitKeys } from '@/features/habits/api';
import { limitKeys } from '@/features/limits/api';
import { tagKeys } from '@/features/tags/api';
import { ApiError } from '@/lib/api/errors';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import {
  createTemplate,
  deleteTemplate,
  getTemplate,
  listTemplates,
  startFromTemplate,
  templateFromGoal,
  templateKeys,
  updateTemplate,
} from './api';
import {
  TemplateErrorCode,
  type GoalExport,
  type Template,
  type TemplateDraft,
  type TemplatePage,
  type TemplatePatch,
  type TemplateSearch,
} from './types';

/**
 * One search, paged as it is scrolled.
 *
 * `keepPreviousData` keeps the last results on screen while a new query
 * types out, so the list does not blank to a spinner on every keystroke.
 */
export function useTemplates(search: TemplateSearch) {
  return useInfiniteQuery({
    queryKey: templateKeys.list(search),
    queryFn: ({ pageParam }) => listTemplates(search, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    select: (data) => data.pages.flatMap((page) => page.templates),
    placeholderData: keepPreviousData,
  });
}

/**
 * The freshest copy of one template across every cached search, with the
 * time that search was fetched — the same seeding `lib/query-cache` does for
 * flat lists, for the paged shape a search is cached in.
 */
function seedFromSearches(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
) {
  let best: { row: Template; updatedAt: number } | undefined;

  for (const query of queryClient.getQueryCache().findAll({
    queryKey: templateKeys.lists(),
  })) {
    const data = query.state.data as InfiniteData<TemplatePage> | undefined;
    const row = data?.pages
      .flatMap((page) => page.templates)
      .find((candidate) => candidate.id === id);

    if (row === undefined) continue;
    if (best !== undefined && query.state.dataUpdatedAt <= best.updatedAt) {
      continue;
    }
    best = { row, updatedAt: query.state.dataUpdatedAt };
  }

  return best;
}

/** One template, opened from a search already on screen. */
export function useTemplate(id: string) {
  const queryClient = useQueryClient();
  const seed = seedFromSearches(queryClient, id);

  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => getTemplate(id),
    initialData: seed?.row,
    initialDataUpdatedAt: seed?.updatedAt,
  });
}

/**
 * Every write invalidates the feature whole: a template's place in a search
 * depends on its scope, language, tags and uses, so which cached searches an
 * edit touches is not knowable from the response.
 *
 * A deleted template's own read is left out, for the reason
 * `features/goals` gives: its screen is still mounted until the delete
 * resolves and navigates away.
 */
function useInvalidateTemplates({ usageMoved }: { usageMoved: boolean }) {
  const queryClient = useQueryClient();

  return async (deletedId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: templateKeys.all,
        predicate:
          deletedId === undefined
            ? undefined
            : ({ queryKey }) =>
                !(queryKey[1] === 'detail' && queryKey[2] === deletedId),
      }),
      ...(usageMoved
        ? [queryClient.invalidateQueries({ queryKey: limitKeys.all })]
        : []),
    ]);
  };
}

export function useCreateTemplate() {
  const invalidate = useInvalidateTemplates({ usageMoved: true });

  const mutation = useMutation<Template, ApiError, TemplateDraft>({
    mutationFn: createTemplate,
    onSuccess: () => invalidate(),
  });

  return {
    createTemplate: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

export function useUpdateTemplate() {
  const invalidate = useInvalidateTemplates({ usageMoved: false });

  const mutation = useMutation<
    Template,
    ApiError,
    { id: string; patch: TemplatePatch }
  >({
    mutationFn: ({ id, patch }) => updateTemplate(id, patch),
    onSuccess: () => invalidate(),
  });

  return {
    updateTemplate: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

export function useDeleteTemplate() {
  const invalidate = useInvalidateTemplates({ usageMoved: true });

  const mutation = useMutation<void, ApiError, string>({
    mutationFn: deleteTemplate,
    onSuccess: (_, id) => invalidate(id),
  });

  return {
    deleteTemplate: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Starts a goal from a template. The goal arrives with habits and tags, and
 * the plan's goal and habit counts both move, so everything a new goal
 * touches is refreshed — and the template's own `uses` with it.
 */
export function useStartFromTemplate() {
  const queryClient = useQueryClient();

  const mutation = useMutation<string, ApiError, string>({
    mutationFn: startFromTemplate,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: goalKeys.all }),
        queryClient.invalidateQueries({ queryKey: habitKeys.all }),
        queryClient.invalidateQueries({ queryKey: tagKeys.all }),
        queryClient.invalidateQueries({ queryKey: limitKeys.all }),
        queryClient.invalidateQueries({ queryKey: templateKeys.all }),
      ]),
  });

  return {
    startFromTemplate: mutation.mutateAsync,
    isStarting: mutation.isPending,
    error: mutation.error,
  };
}

export function useTemplateFromGoal() {
  const invalidate = useInvalidateTemplates({ usageMoved: true });

  const mutation = useMutation<
    Template,
    ApiError,
    { goalId: string; value: GoalExport }
  >({
    mutationFn: ({ goalId, value }) => templateFromGoal(goalId, value),
    onSuccess: () => invalidate(),
  });

  return {
    templateFromGoal: mutation.mutateAsync,
    isExporting: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Maps the backend's error codes onto copy a user can act on. Codes are the
 * contract; the `error` string in the body is English-only and for logs.
 */
const MESSAGES: Record<string, TranslationKey> = {
  [TemplateErrorCode.LimitReached]: 'templates.errors.limitReached',
  [TemplateErrorCode.GoalLimitReached]: 'templates.errors.goalLimitReached',
  [TemplateErrorCode.HabitLimitReached]: 'templates.errors.habitLimitReached',
  [TemplateErrorCode.NotFound]: 'templates.errors.notFound',
};

export function useTemplateErrorMessage() {
  const { t } = useTranslations();

  return useCallback(
    (error: unknown): string | null => {
      if (!error) return null;
      if (!(error instanceof ApiError)) return t('templates.errors.generic');
      if (error.isNetworkError) return t('templates.errors.network');
      return t(MESSAGES[error.code] ?? 'templates.errors.generic');
    },
    [t],
  );
}
