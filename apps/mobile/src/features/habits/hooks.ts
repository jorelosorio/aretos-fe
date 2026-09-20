import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { goalKeys } from '@/features/goals';
import { limitKeys } from '@/features/limits';
import { ApiError } from '@/lib/api';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import {
  createHabit,
  deleteHabit,
  getHabit,
  habitKeys,
  listHabits,
  updateHabit,
} from './api';
import {
  HabitErrorCode,
  type Habit,
  type HabitDraft,
  type HabitPatch,
} from './types';

/** One goal's habits, or every habit when `goalId` is omitted. */
export function useHabits(
  goalId?: string,
  archived: boolean | undefined = false,
) {
  return useQuery({
    queryKey: habitKeys.list(goalId, archived),
    queryFn: () => listHabits(goalId, archived),
  });
}

/** One habit, for the edit form. Seeded from whichever list holds it. */
export function useHabit(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: habitKeys.detail(id),
    queryFn: () => getHabit(id),
    initialData: () =>
      queryClient
        .getQueriesData<Habit[]>({ queryKey: habitKeys.lists() })
        .flatMap(([, habits]) => habits ?? [])
        .find((habit) => habit.id === id),
  });
}

/**
 * A habit write moves two things that live elsewhere: the tier's habit usage
 * in `/v1/limits`, and `habit_count` on the goal the habit belongs to.
 */
function useInvalidateHabits() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: habitKeys.all });
    await queryClient.invalidateQueries({ queryKey: goalKeys.all });
    await queryClient.invalidateQueries({ queryKey: limitKeys.all });
  };
}

export function useCreateHabit(goalId: string) {
  const invalidate = useInvalidateHabits();

  const mutation = useMutation<Habit, ApiError, HabitDraft>({
    mutationFn: (draft) => createHabit(goalId, draft),
    onSuccess: invalidate,
  });

  return {
    createHabit: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

export function useUpdateHabit() {
  const invalidate = useInvalidateHabits();

  const mutation = useMutation<
    Habit,
    ApiError,
    { id: string; patch: HabitPatch }
  >({
    mutationFn: ({ id, patch }) => updateHabit(id, patch),
    onSuccess: invalidate,
  });

  return {
    updateHabit: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

export function useDeleteHabit() {
  const invalidate = useInvalidateHabits();

  const mutation = useMutation<void, ApiError, string>({
    mutationFn: deleteHabit,
    onSuccess: invalidate,
  });

  return {
    deleteHabit: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}

const MESSAGES: Record<string, TranslationKey> = {
  [HabitErrorCode.LimitReached]: 'habits.errors.limitReached',
  [HabitErrorCode.NotFound]: 'habits.errors.notFound',
};

export function useHabitErrorMessage() {
  const { t } = useTranslations();

  return useCallback(
    (error: unknown): string | null => {
      if (!error) return null;
      if (!(error instanceof ApiError)) return t('habits.errors.generic');
      if (error.isNetworkError) return t('habits.errors.network');
      return t(MESSAGES[error.code] ?? 'habits.errors.generic');
    },
    [t],
  );
}
