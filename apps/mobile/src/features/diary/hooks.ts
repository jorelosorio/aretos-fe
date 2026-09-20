import { useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { ApiError } from '@/lib/api';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import { diaryKeys, listDiary } from './api';
import {
  DiaryErrorCode,
  type DiaryEntry,
  type DiaryFilter,
  type DiaryPage,
} from './types';

/**
 * The diary as a screen reads it: one list, however many pages it took.
 *
 * `total` and `historyCutoff` are taken from the first page rather than the
 * last. Both describe the whole filtered range, and the first page is the one
 * that cannot go missing — reading them off the newest page keeps them steady
 * while the older ones are still arriving.
 */
export type Diary = {
  entries: DiaryEntry[];
  total: number;
  timezone: string;
  historyCutoff: string | null;
};

const flatten = (pages: readonly DiaryPage[]): Diary => ({
  entries: pages.flatMap((page) => page.entries),
  total: pages[0]?.total ?? 0,
  timezone: pages[0]?.timezone ?? '',
  historyCutoff: pages[0]?.historyCutoff ?? null,
});

/**
 * One filtered diary, paged as it is scrolled.
 *
 * Keyset rather than offset, which is why this is an infinite query and not a
 * page number: a diary is read backwards and grows at the end it is read from,
 * so an offset walks the same row twice when something is written between two
 * pages. The cursor is the server's token and is only ever handed back.
 */
export function useDiary(filter: DiaryFilter = {}) {
  return useInfiniteQuery({
    queryKey: diaryKeys.list(filter),
    queryFn: ({ pageParam }) => listDiary(filter, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => flatten(data.pages),
  });
}

const MESSAGES: Record<string, TranslationKey> = {
  [DiaryErrorCode.BadRequest]: 'diary.errors.badRequest',
};

export function useDiaryErrorMessage() {
  const { t } = useTranslations();

  return useCallback(
    (error: unknown): string | null => {
      if (!error) return null;
      if (!(error instanceof ApiError)) return t('diary.errors.generic');
      if (error.isNetworkError) return t('diary.errors.network');
      return t(MESSAGES[error.code] ?? 'diary.errors.generic');
    },
    [t],
  );
}
