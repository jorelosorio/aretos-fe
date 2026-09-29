import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { diaryKeys } from '@/features/diary/api';
import { goalKeys } from '@/features/goals/api';
import { GoalErrorCode } from '@/features/goals/types';
import { habitKeys } from '@/features/habits/api';
import { HabitErrorCode } from '@/features/habits/types';
import { limitKeys } from '@/features/limits/api';
import { logKeys } from '@/features/logs/api';
import { LogErrorCode } from '@/features/logs/types';
import { ApiError } from '@/lib/api/errors';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import { completeGuide } from './api';
import type { GuideDraft, GuideProgress } from './types';

/**
 * Saves the guide, and refreshes everything it touched.
 *
 * The refresh runs when the save settles, not only when it succeeds: a
 * save that failed half-way has still created a goal, and if the user
 * leaves the guide there, Home and Goals should show it.
 */
export function useCompleteGuide() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    string,
    Error,
    { draft: GuideDraft; progress: GuideProgress }
  >({
    mutationFn: ({ draft, progress }) => completeGuide(draft, progress),
    onSettled: async () => {
      await Promise.all(
        [
          goalKeys.all,
          habitKeys.all,
          logKeys.all,
          diaryKeys.all,
          limitKeys.all,
        ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );
    },
  });

  return {
    completeGuide: mutation.mutateAsync,
    isCompleting: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * The save touches three resources, so a plan limit can come from any of
 * them; each keeps its own copy. Everything else reads as the goal
 * feature's generic and network errors.
 */
const MESSAGES: Record<string, TranslationKey> = {
  [GoalErrorCode.LimitReached]: 'goals.errors.limitReached',
  [HabitErrorCode.LimitReached]: 'habits.errors.limitReached',
  [LogErrorCode.LimitReached]: 'logs.errors.limitReached',
};

export function useGuideErrorMessage() {
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
