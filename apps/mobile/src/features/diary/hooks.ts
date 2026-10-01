import { useCallback, useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { ApiError } from '@/lib/api/errors';
import {
  canRead,
  databaseOf as ready,
  useLocalDatabase,
} from '@/lib/db/context';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import { addCheckInNote, diaryKeys, getWireNote, noteReadKeys } from './api';
import {
  countUnsyncedNotes,
  deleteNote,
  readDiaryPage,
  readNote,
  saveNote,
} from './local';
import { keepNote } from './sync';
import {
  DiaryErrorCode,
  type CheckInNote,
  type CheckInNoteDraft,
  type DiaryFilter,
  type DiaryNote,
  type DiaryPage,
  type NoteDraft,
} from './types';

/**
 * The diary is read from and written to the device's database
 * (`local.ts`), and traded with the server in the background (`sync.ts`).
 * So a note written offline is in the diary at once, and the screens never
 * wait on the network to show what is already here.
 *
 * Reads still go through React Query, for its paging and its cache: the
 * query functions read SQLite instead of the API, and a write or a sync
 * invalidates them. `networkMode: 'always'` on all of them, because React
 * Query otherwise pauses a query while offline — which is exactly when the
 * device's copy is the one that matters.
 */

/** Everything a note reaching the server moves — see `noteReadKeys`. */
function invalidateNoteReads(queryClient: QueryClient) {
  return Promise.all(
    noteReadKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
}

/**
 * The diary as a screen reads it: one list, however many pages it took.
 *
 * `total`, `from` and `historyCutoff` are taken from the first page rather
 * than the last. All three describe the whole filtered range, and the first
 * page is the one that cannot go missing.
 */
export type Diary = {
  notes: DiaryNote[];
  total: number;
  /**
   * The earliest day the diary shows — the plan's floor — or `null` when the
   * plan reads everything. Null until the first page arrives.
   */
  from: string | null;
  timezone: string;
  historyCutoff: string | null;
  hasMoreHistory: boolean;
};

const flatten = (pages: readonly DiaryPage[]): Diary => ({
  notes: pages.flatMap((page) => page.notes),
  total: pages[0]?.total ?? 0,
  from: pages[0]?.from ?? null,
  timezone: pages[0]?.timezone ?? '',
  historyCutoff: pages[0]?.historyCutoff ?? null,
  hasMoreHistory: pages[0]?.hasMoreHistory ?? false,
});

/**
 * One filtered diary, paged as it is scrolled, from the device.
 *
 * `refetch` — pull to refresh — syncs first, so it asks the server what
 * changed elsewhere, and `isRefetching` covers the sync too.
 */
export function useDiary(filter: DiaryFilter = {}) {
  const local = useLocalDatabase();
  const [syncing, setSyncing] = useState(false);

  const query = useInfiniteQuery({
    queryKey: diaryKeys.list(filter),
    enabled: canRead(local),
    networkMode: 'always',
    queryFn: ({ pageParam }) => readDiaryPage(ready(local), filter, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => flatten(data.pages),
  });

  const refetch = async () => {
    setSyncing(true);
    try {
      if (local.status === 'ready') await local.requestSync();
      return await query.refetch();
    } finally {
      setSyncing(false);
    }
  };

  // Named rather than spread: spreading reads every field of the result,
  // which React Query then treats as used and re-renders on.
  return {
    data: query.data,
    error: query.error,
    isPending: query.isPending || local.status === 'opening',
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    refetch,
    isRefetching: syncing,
  };
}

/**
 * One note, for the reader: the device's copy when it holds one, which is
 * every note in the diary. A link to a note written elsewhere and not yet
 * pulled is read from the server and kept, so it can be edited and deleted
 * like any other.
 *
 * A note deleted here, and not yet confirmed, is not found — the server
 * still has it, but this device has said it is gone.
 */
export function useNote(id: string) {
  const local = useLocalDatabase();

  return useQuery({
    queryKey: diaryKeys.detail(id),
    enabled: canRead(local),
    networkMode: 'always',
    queryFn: async () => {
      const held = readNote(ready(local), id);
      if (held !== null && held !== 'deleted') return held;

      const fetched = held === 'deleted' ? null : await getWireNote(id);
      if (fetched === null) {
        // A status, so it reads as "not found" rather than as a connection
        // that failed, and is not retried.
        throw new ApiError(DiaryErrorCode.NotFound, 'note not found', 404);
      }
      keepNote(ready(local), fetched);
      return readNote(ready(local), id) as DiaryNote;
    },
  });
}

/**
 * Saves the editor's value to the device and queues it for the server. The
 * diary shows it at once; the server sees it on the next sync, which this
 * asks for.
 */
export function useWriteNote() {
  const local = useLocalDatabase();
  const queryClient = useQueryClient();

  const mutation = useMutation<
    string,
    Error,
    { note: DiaryNote | null; value: NoteDraft }
  >({
    networkMode: 'always',
    mutationFn: async ({ note, value }) => saveNote(ready(local), note, value),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: diaryKeys.all });
      if (local.status === 'ready') void local.requestSync();
    },
  });

  const writeNote = (note: DiaryNote | null, value: NoteDraft) =>
    mutation.mutateAsync({ note, value });

  return {
    writeNote,
    isWriting: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Deletes a note on the device and queues the delete. The note's own read is
 * left alone: its screen is still on its way back, and reading it now would
 * put "not found" on screen over the note the person just deleted.
 */
export function useRemoveNote() {
  const local = useLocalDatabase();
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, DiaryNote>({
    networkMode: 'always',
    mutationFn: async (note) => deleteNote(ready(local), note.id),
    onSuccess: async (_, note) => {
      await queryClient.invalidateQueries({
        queryKey: diaryKeys.all,
        predicate: ({ queryKey }) =>
          !(queryKey[1] === 'detail' && queryKey[2] === note.id),
      });
      if (local.status === 'ready') void local.requestSync();
    },
  });

  return {
    removeNote: mutation.mutateAsync,
    isRemoving: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Adds a note to a check-in through the check-in's own route, online: the
 * check-in screen reads its notes from the check-in, which only the server
 * holds. A sync then brings the note into the device's diary.
 */
export function useAddCheckInNote() {
  const local = useLocalDatabase();
  const queryClient = useQueryClient();

  const mutation = useMutation<
    CheckInNote,
    ApiError,
    { logId: string; note: CheckInNoteDraft }
  >({
    mutationFn: ({ logId, note }) => addCheckInNote(logId, note),
    onSuccess: async () => {
      await invalidateNoteReads(queryClient);
      if (local.status === 'ready') void local.requestSync();
    },
  });

  return {
    addCheckInNote: mutation.mutateAsync,
    isAdding: mutation.isPending,
    error: mutation.error,
  };
}

/** How many notes the server does not have as they are here. */
export function useUnsyncedNoteCount(): number {
  const local = useLocalDatabase();

  const { data } = useQuery({
    queryKey: [...diaryKeys.all, 'pending'],
    enabled: local.status === 'ready',
    networkMode: 'always',
    queryFn: () => countUnsyncedNotes(ready(local)),
  });

  return data ?? 0;
}

const LIST_MESSAGES: Record<string, TranslationKey> = {
  [DiaryErrorCode.BadRequest]: 'diary.errors.badRequest',
};

/** For the list: a read that failed. */
export function useDiaryErrorMessage() {
  const { t } = useTranslations();

  return useCallback(
    (error: unknown): string | null => {
      if (!error) return null;
      if (!(error instanceof ApiError)) return t('diary.errors.generic');
      if (error.isNetworkError) return t('diary.errors.network');
      return t(LIST_MESSAGES[error.code] ?? 'diary.errors.generic');
    },
    [t],
  );
}

/**
 * For a write. A `BAD_REQUEST` there is a body or a tag the server refused,
 * which is not the list's "we couldn't read the diary".
 */
const WRITE_MESSAGES: Record<string, TranslationKey> = {
  [DiaryErrorCode.BadRequest]: 'diary.errors.invalidNote',
  [DiaryErrorCode.LimitReached]: 'diary.errors.limitReached',
  [DiaryErrorCode.NotFound]: 'diary.errors.notFound',
  [DiaryErrorCode.GoalArchived]: 'diary.errors.goalArchived',
};

export function useNoteErrorMessage() {
  const { t } = useTranslations();

  return useCallback(
    (error: unknown): string | null => {
      if (!error) return null;
      if (!(error instanceof ApiError)) return t('diary.errors.generic');
      if (error.isNetworkError) return t('diary.errors.network');
      return t(WRITE_MESSAGES[error.code] ?? 'diary.errors.generic');
    },
    [t],
  );
}

/**
 * Why the server refused a note's last change, in the write messages' words,
 * or `null` for a note that is synced or on its way.
 */
export function useNoteSyncMessage() {
  const { t } = useTranslations();

  return useCallback(
    (note: DiaryNote): string | null => {
      if (note.sync.state !== 'rejected') return null;
      return t(
        WRITE_MESSAGES[note.sync.errorCode ?? ''] ?? 'diary.errors.generic',
      );
    },
    [t],
  );
}
