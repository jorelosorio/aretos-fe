import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { goalKeys } from '@/features/goals';
import { limitKeys } from '@/features/limits';
import { ApiError } from '@/lib/api';
import { seedFromLists } from '@/lib/query-cache';
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

  // Dated with the list's own timestamp — see `lib/query-cache` for why an
  // undated seed refetches at every mount instead of never.
  const seed = seedFromLists<Habit>(queryClient, habitKeys.lists(), id);

  return useQuery({
    queryKey: habitKeys.detail(id),
    queryFn: () => getHabit(id),
    initialData: seed?.row,
    initialDataUpdatedAt: seed?.updatedAt,
  });
}

/**
 * A habit write moves things that live elsewhere, and which ones depends on
 * the write.
 *
 * Always the goals: `habit_count` rides on the goal, and so does the
 * `?include=progress` block, which scores every period against this goal's
 * habits — editing a habit's threshold or weight rescores the whole week.
 *
 * `/v1/limits` only when a row appears or disappears. The plan caps rows
 * owned, not rows in use — `resourceCount` in `limits_service.go` counts
 * archived habits too — so an edit, archive or un-archive cannot move the
 * usage behind `can_create`, and refetching it was one wasted request per
 * keystroke-sized save.
 */
function useInvalidateHabits({ usageMoved }: { usageMoved: boolean }) {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: habitKeys.all });
    await queryClient.invalidateQueries({ queryKey: goalKeys.all });
    if (usageMoved) {
      await queryClient.invalidateQueries({ queryKey: limitKeys.all });
    }
  };
}

export function useCreateHabit(goalId: string) {
  const invalidate = useInvalidateHabits({ usageMoved: true });

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
  const invalidate = useInvalidateHabits({ usageMoved: false });

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
  const invalidate = useInvalidateHabits({ usageMoved: true });

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
