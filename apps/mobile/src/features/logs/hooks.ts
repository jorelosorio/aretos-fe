import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

/** One log by id, for a journal entry opened on its own. */
export function useLog(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: logKeys.detail(id),
    queryFn: () => getLog(id),
    initialData: () =>
      queryClient
        .getQueriesData<Log[]>({ queryKey: logKeys.lists() })
        .flatMap(([, logs]) => logs ?? [])
        .find((log) => log.id === id),
  });
}

/**
 * The log for one goal's period, or `undefined` when the period is unwritten.
 *
 * Asked as a one-day window rather than by id, because the check-in knows
 * which period it is on but not whether a log exists for it. `entryDate` must
 * already be the period's first day — `periodKey` is what puts it there — or a
 * weekly goal's Wednesday will match nothing and the screen will offer to
 * write a period that is already written.
 */
export function useLogForPeriod(goalId: string, entryDate: string) {
  const filter = { goalId, from: entryDate, to: entryDate };
  const query = useLogs(filter);

  return { ...query, data: query.data?.[0] };
}

/**
 * A log write moves two things that live elsewhere.
 *
 * The tier's habit_log usage in `/v1/limits` — the limit is on logs owned,
 * and Save is the only thing that mints one.
 *
 * And the goal's `?include=progress` block, which scores this very period:
 * the streak, the week and `current_period` are all read off the goal now, so
 * a check-in that left the goals cache alone would send the user back to a
 * home screen still showing the period they just filled in as empty.
 */
function useInvalidateLogs() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: logKeys.all });
    await queryClient.invalidateQueries({ queryKey: goalKeys.all });
    await queryClient.invalidateQueries({ queryKey: limitKeys.all });
  };
}

/** Writes a whole period. The same draft twice leaves one log, not two. */
export function useSaveLog() {
  const invalidate = useInvalidateLogs();

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
  const invalidate = useInvalidateLogs();

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
  const invalidate = useInvalidateLogs();

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
