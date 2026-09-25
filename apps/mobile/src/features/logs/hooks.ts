import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { diaryKeys } from '@/features/diary';
import { goalKeys } from '@/features/goals';
import { limitKeys } from '@/features/limits';
import { ApiError } from '@/lib/api';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import {
  deleteLog,
  getLog,
  listLogs,
  logKeys,
  saveLog,
  updateLog,
} from './api';
import {
  LogErrorCode,
  type Log,
  type LogDraft,
  type LogFilter,
  type LogPatch,
} from './types';

/** The journal. Unfiltered it spans every goal, which is what the diary shows. */
export function useLogs(filter: LogFilter = {}) {
  return useQuery({
    queryKey: logKeys.list(filter),
    queryFn: () => listLogs(filter),
  });
}

/**
 * One log by id — the check-in reads its notes from here. `null` is a period
 * with nothing saved, which has no log to read and no notes on it.
 */
export function useLog(id: string | null) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: logKeys.detail(id ?? ''),
    queryFn: () => getLog(id as string),
    enabled: id !== null,
    initialData: () =>
      queryClient
        .getQueriesData<Log[]>({ queryKey: logKeys.lists() })
        .flatMap(([, logs]) => logs ?? [])
        .find((log) => log.id === id),
  });
}

/**
 * A log write moves three things that live elsewhere.
 *
 * The goal's `?include=progress` block, always: it scores this very period,
 * and the streak, the week and `current_period` are all read off the goal
 * now, so a check-in that left the goals cache alone would send the user back
 * to a home screen still showing the period they just filled in as empty.
 *
 * The diary, always. `/v1/diary-notes` scores every check-in note beside
 * its period, so a save that changes an answer or the mood changes what the
 * diary shows next to each note written on it.
 *
 * The tier's habit_log usage in `/v1/limits` only when a row appears or
 * disappears. Save mints a log the first time a period is written and
 * Delete removes it; amending one with PATCH moves nothing, because the cap
 * counts logs owned.
 */
function useInvalidateLogs({ usageMoved }: { usageMoved: boolean }) {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: logKeys.all });
    await queryClient.invalidateQueries({ queryKey: goalKeys.all });
    await queryClient.invalidateQueries({ queryKey: diaryKeys.all });
    if (usageMoved) {
      await queryClient.invalidateQueries({ queryKey: limitKeys.all });
    }
  };
}

/** Writes a whole period. The same draft twice leaves one log, not two. */
export function useSaveLog() {
  const invalidate = useInvalidateLogs({ usageMoved: true });

  const mutation = useMutation<Log, ApiError, LogDraft>({
    mutationFn: saveLog,
    onSuccess: invalidate,
  });

  return {
    saveLog: mutation.mutateAsync,
    isSaving: mutation.isPending,
    error: mutation.error,
  };
}

export function useUpdateLog() {
  const invalidate = useInvalidateLogs({ usageMoved: false });

  const mutation = useMutation<Log, ApiError, { id: string; patch: LogPatch }>({
    mutationFn: ({ id, patch }) => updateLog(id, patch),
    onSuccess: invalidate,
  });

  return {
    updateLog: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

export function useDeleteLog() {
  const invalidate = useInvalidateLogs({ usageMoved: true });

  const mutation = useMutation<void, ApiError, string>({
    mutationFn: deleteLog,
    onSuccess: invalidate,
  });

  return {
    deleteLog: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}

const MESSAGES: Record<string, TranslationKey> = {
  [LogErrorCode.LimitReached]: 'logs.errors.limitReached',
  [LogErrorCode.NotFound]: 'logs.errors.notFound',
  [LogErrorCode.GoalArchived]: 'logs.errors.goalArchived',
};

export function useLogErrorMessage() {
  const { t } = useTranslations();

  return useCallback(
    (error: unknown): string | null => {
      if (!error) return null;
      if (!(error instanceof ApiError)) return t('logs.errors.generic');
      if (error.isNetworkError) return t('logs.errors.network');
      return t(MESSAGES[error.code] ?? 'logs.errors.generic');
    },
    [t],
  );
}
