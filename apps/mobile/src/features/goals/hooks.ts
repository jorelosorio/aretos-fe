import { useCallback } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { limitKeys } from '@/features/limits';
import { ApiError } from '@/lib/api';
import { seedFromLists } from '@/lib/query-cache';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import {
  createGoal,
  deleteGoal,
  getGoal,
  goalKeys,
  listGoals,
  updateGoal,
  type GoalReadOptions,
  type ListGoalsOptions,
} from './api';
import {
  GoalErrorCode,
  type Goal,
  type GoalDraft,
  type GoalPatch,
} from './types';

/**
 * The user's goals. Defaults to the active ones, which is every screen that
 * has a list; pass `{ archived: true }` for the archive and
 * `{ archived: undefined }` for both at once.
 *
 * With `{ include: ['progress'] }` every goal carries its streak and its scored
 * week, which is what lets the home screen be a single request.
 */
export function useGoals(options: ListGoalsOptions = {}) {
  const query: ListGoalsOptions = { archived: false, ...options };

  return useQuery({
    queryKey: goalKeys.list(query),
    queryFn: () => listGoals(query),
  });
}

/** One goal, for the edit form. */
export function useGoal(id: string) {
  const queryClient = useQueryClient();

  // The list the user tapped through is already cached, so the form opens
  // filled in rather than spinning; the fetch behind it then confirms. A
  // deep link with no list behind it finds nothing here and simply loads.
  //
  // Dated with the list's own timestamp: undated, the seed would look fresh
  // at every mount and so refetch at every mount — see `lib/query-cache`.
  const seed = seedFromLists<Goal>(queryClient, goalKeys.lists(), id);

  return useQuery({
    queryKey: goalKeys.detail(id),
    queryFn: () => getGoal(id),
    initialData: seed?.row,
    initialDataUpdatedAt: seed?.updatedAt,
  });
}

/**
 * Everything one week of check-ins needs, in one request.
 *
 * The goal, its active habits and the saved answers used to be three:
 * `/v1/goals/:id`, `/v1/habits?goal_id=` and a `/v1/habit-logs` window.
 * `?include=habits,progress` answers all three at once.
 *
 * The window is a week rather than the one day being edited, because the
 * check-in's strip shows how the whole week went and moving between its days
 * has to be instant. Seven days cost the same request one did.
 *
 * Which week is the server's to decide: `date` names a day and the server
 * answers with the Monday-to-Sunday week holding it (today's, with no date),
 * in the caller's zone. Every period comes back with its own `entry_date` and
 * `end_date`, so the screen finds the period a day belongs to by looking for
 * the range that holds it — the server's snapping stays the only one — and
 * asks again with a new `date` only when a day falls outside the `from`–`to`
 * it was given.
 *
 * `keepPreviousData` is what keeps the strip on screen while another week
 * loads. It hands back the previous week's periods in the meantime, so a
 * caller must match a period by date before editing it rather than assuming
 * the block it is holding belongs to the day it is showing.
 *
 * Not seeded from a cached list: a list row carries neither block, and
 * showing the goal while the habits are still missing would render a period
 * with no rows in it.
 */
export function useGoalCheckIn(id: string, date?: string) {
  const options: GoalReadOptions = {
    include: ['habits', 'progress'],
    ...(date === undefined ? {} : { date }),
  };

  return useQuery({
    queryKey: goalKeys.detail(id, options),
    queryFn: () => getGoal(id, options),
    placeholderData: keepPreviousData,
  });
}

/**
 * Every write invalidates the whole feature rather than patching one list.
 *
 * A goal moves between the active and archived lists, and its colour shows
 * wherever it is named — the diary and the analysis carry their own copy —
 * so the queries a write touches are not knowable from the response alone.
 *
 * The plan's limits go with it, but only when a row appears or disappears.
 * Creating and deleting move the usage count behind `can_create`, which is
 * what the goals screen reads to decide whether to offer another one; an
 * edit or an archive cannot, because the cap is on rows owned and
 * `resourceCount` in `limits_service.go` counts archived rows too.
 */
function useInvalidateGoals({ usageMoved }: { usageMoved: boolean }) {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: goalKeys.all });
    if (usageMoved) {
      await queryClient.invalidateQueries({ queryKey: limitKeys.all });
    }
  };
}

export function useCreateGoal() {
  const invalidate = useInvalidateGoals({ usageMoved: true });

  const mutation = useMutation<Goal, ApiError, GoalDraft>({
    mutationFn: createGoal,
    onSuccess: invalidate,
  });

  return {
    createGoal: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

export function useUpdateGoal() {
  const invalidate = useInvalidateGoals({ usageMoved: false });

  const mutation = useMutation<
    Goal,
    ApiError,
    { id: string; patch: GoalPatch }
  >({
    mutationFn: ({ id, patch }) => updateGoal(id, patch),
    onSuccess: invalidate,
  });

  return {
    updateGoal: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

export function useDeleteGoal() {
  const invalidate = useInvalidateGoals({ usageMoved: true });

  const mutation = useMutation<void, ApiError, string>({
    mutationFn: deleteGoal,
    onSuccess: invalidate,
  });

  return {
    deleteGoal: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Maps the backend's error codes onto copy a user can act on. Codes are the
 * contract; the `error` string in the body is English-only and for logs.
 */
const MESSAGES: Record<string, TranslationKey> = {
  [GoalErrorCode.LimitReached]: 'goals.errors.limitReached',
  [GoalErrorCode.NotFound]: 'goals.errors.notFound',
  [GoalErrorCode.Archived]: 'goals.errors.archived',
};

export function useGoalErrorMessage() {
  const { t } = useTranslations();

  return useCallback(
    (error: unknown): string | null => {
      if (!error) return null;
      if (!(error instanceof ApiError)) return t('goals.errors.generic');
      if (error.isNetworkError) return t('goals.errors.network');
      return t(MESSAGES[error.code] ?? 'goals.errors.generic');
    },
    [t],
  );
}
