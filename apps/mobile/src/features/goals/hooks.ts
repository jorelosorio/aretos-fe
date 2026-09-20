import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { limitKeys } from '@/features/limits';
import { ApiError } from '@/lib/api';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import {
  createGoal,
  deleteGoal,
  getGoal,
  goalKeys,
  listGoals,
  updateGoal,
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
 * With `{ include: 'progress' }` every goal carries its streak and its scored
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

  return useQuery({
    queryKey: goalKeys.detail(id),
    queryFn: () => getGoal(id),
    // The list the user tapped through is already cached, so the form opens
    // filled in rather than spinning; the fetch behind it then confirms. A
    // deep link with no list behind it finds nothing here and simply loads.
    initialData: () =>
      queryClient
        .getQueriesData<Goal[]>({ queryKey: goalKeys.lists() })
        .flatMap(([, goals]) => goals ?? [])
        .find((goal) => goal.id === id),
  });
}

/**
 * Every write invalidates the whole feature rather than patching one list.
 *
 * A goal moves between the active and archived lists, and the server assigns
 * `color_slot` and orders by it, so the lists a write touches are not
 * knowable from the response alone.
 *
 * The plan's limits go with it: creating and deleting move the usage count
 * behind `can_create`, which is what the goals screen reads to decide
 * whether to offer another one.
 */
function useInvalidateGoals() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: goalKeys.all });
    await queryClient.invalidateQueries({ queryKey: limitKeys.all });
  };
}

export function useCreateGoal() {
  const invalidate = useInvalidateGoals();

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
  const invalidate = useInvalidateGoals();

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
  const invalidate = useInvalidateGoals();

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
