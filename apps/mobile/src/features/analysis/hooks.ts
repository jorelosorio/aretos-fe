import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import { ApiError } from '@/lib/api';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import { analysisKeys, getAnalysis } from './api';
import { AnalysisErrorCode, type AnalysisWindow } from './types';

/**
 * One report over one window, optionally narrowed to one goal.
 *
 * A plain query rather than an infinite one: the report is a single document
 * whatever the window, and the server builds all of it in four reads.
 *
 * `placeholderData` keeps the previous scope's report on screen while the next
 * one loads, so changing the window or the goal re-draws the cards in place
 * rather than dropping the whole screen back to a spinner.
 */
export function useAnalysis(
  days: AnalysisWindow,
  goalId: string | null = null,
) {
  return useQuery({
    queryKey: analysisKeys.report(days, goalId),
    queryFn: () => getAnalysis(days, goalId),
    placeholderData: (previous) => previous,
  });
}

const MESSAGES: Record<string, TranslationKey> = {
  [AnalysisErrorCode.BadRequest]: 'analysis.errors.badRequest',
  [AnalysisErrorCode.TierNotAllowed]: 'analysis.errors.locked',
};

export function useAnalysisErrorMessage() {
  const { t } = useTranslations();

  return useCallback(
    (error: unknown): string | null => {
      if (!error) return null;
      if (!(error instanceof ApiError)) return t('analysis.errors.generic');
      if (error.isNetworkError) return t('analysis.errors.network');
      return t(MESSAGES[error.code] ?? 'analysis.errors.generic');
    },
    [t],
  );
}
