import { useCallback } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { goalKeys } from '@/features/goals';
import { limitKeys } from '@/features/limits';
import { tagKeys } from '@/features/tags';
import { ApiError } from '@/lib/api';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import {
  addCheckInNote,
  createNote,
  deleteCheckInNote,
  deleteNote,
  diaryKeys,
  listNotes,
  updateCheckInNote,
  updateNote,
} from './api';
import { planNoteWrite } from './routing';
import {
  DiaryErrorCode,
  type CheckInNote,
  type CheckInNoteDraft,
  type CheckInNotePatch,
  type DiaryFilter,
  type DiaryNote,
  type DiaryPage,
  type NoteDraft,
  type NotePatch,
} from './types';

/**
 * The diary as a screen reads it: one list, however many pages it took.
 *
 * `total` and `historyCutoff` are taken from the first page rather than the
 * last. Both describe the whole filtered range, and the first page is the one
 * that cannot go missing.
 */
export type Diary = {
  notes: DiaryNote[];
  total: number;
  timezone: string;
  historyCutoff: string | null;
  hasMoreHistory: boolean;
};

const flatten = (pages: readonly DiaryPage[]): Diary => ({
  notes: pages.flatMap((page) => page.notes),
  total: pages[0]?.total ?? 0,
  timezone: pages[0]?.timezone ?? '',
  historyCutoff: pages[0]?.historyCutoff ?? null,
  hasMoreHistory: pages[0]?.hasMoreHistory ?? false,
});

/**
 * One filtered diary, paged as it is scrolled.
 *
 * Keyset rather than offset, which is why this is an infinite query: a diary
 * is read backwards and grows at the end it is read from, so an offset walks
 * the same row twice when something is written between two pages.
 */
export function useDiary(filter: DiaryFilter = {}) {
  return useInfiniteQuery({
    queryKey: diaryKeys.list(filter),
    queryFn: ({ pageParam }) => listNotes(filter, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => flatten(data.pages),
  });
}

/**
 * `logKeys.all`, spelled out rather than imported: `features/logs` imports
 * this feature to invalidate the diary when a check-in is saved, and
 * importing its barrel back here is a require cycle Metro resolves to a
 * half-built module. The key's first segment is the whole contract.
 */
const LOG_KEYS_ROOT = ['logs'] as const;

/**
 * A note write moves five things that live elsewhere.
 *
 * The diary lists, obviously. The check-in's log, because `/v1/habit-logs`
 * carries a check-in's notes. The goals' `?include=progress`, because each
 * period reports its `note_count`. The tag suggestions, because saving a
 * name creates a tag and moves its `uses`. And the plan's `diary_note` usage
 * in `/v1/limits` — only when a note appears or disappears, since the cap
 * counts notes owned and an edit moves nothing.
 */
function useInvalidateNotes({ usageMoved }: { usageMoved: boolean }) {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: diaryKeys.all }),
      queryClient.invalidateQueries({ queryKey: LOG_KEYS_ROOT }),
      queryClient.invalidateQueries({ queryKey: goalKeys.all }),
      queryClient.invalidateQueries({ queryKey: tagKeys.all }),
      ...(usageMoved
        ? [queryClient.invalidateQueries({ queryKey: limitKeys.all })]
        : []),
    ]);
  };
}

export function useCreateNote() {
  const invalidate = useInvalidateNotes({ usageMoved: true });

  const mutation = useMutation<DiaryNote, ApiError, NoteDraft>({
    mutationFn: createNote,
    onSuccess: invalidate,
  });

  return {
    createNote: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

export function useUpdateNote() {
  const invalidate = useInvalidateNotes({ usageMoved: false });

  const mutation = useMutation<
    DiaryNote,
    ApiError,
    { id: string; patch: NotePatch }
  >({
    mutationFn: ({ id, patch }) => updateNote(id, patch),
    onSuccess: invalidate,
  });

  return {
    updateNote: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

export function useDeleteNote() {
  const invalidate = useInvalidateNotes({ usageMoved: true });

  const mutation = useMutation<void, ApiError, string>({
    mutationFn: deleteNote,
    onSuccess: invalidate,
  });

  return {
    deleteNote: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}

export function useAddCheckInNote() {
  const invalidate = useInvalidateNotes({ usageMoved: true });

  const mutation = useMutation<
    CheckInNote,
    ApiError,
    { logId: string; note: CheckInNoteDraft }
  >({
    mutationFn: ({ logId, note }) => addCheckInNote(logId, note),
    onSuccess: invalidate,
  });

  return {
    addCheckInNote: mutation.mutateAsync,
    isAdding: mutation.isPending,
    error: mutation.error,
  };
}

export function useUpdateCheckInNote() {
  const invalidate = useInvalidateNotes({ usageMoved: false });

  const mutation = useMutation<
    CheckInNote,
    ApiError,
    { logId: string; noteId: string; patch: CheckInNotePatch }
  >({
    mutationFn: ({ logId, noteId, patch }) =>
      updateCheckInNote(logId, noteId, patch),
    onSuccess: invalidate,
  });

  return {
    updateCheckInNote: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

export function useDeleteCheckInNote() {
  const invalidate = useInvalidateNotes({ usageMoved: true });

  const mutation = useMutation<
    void,
    ApiError,
    { logId: string; noteId: string }
  >({
    mutationFn: ({ logId, noteId }) => deleteCheckInNote(logId, noteId),
    onSuccess: invalidate,
  });

  return {
    deleteCheckInNote: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Saves the editor's value to whichever route the note belongs to — see
 * `planNoteWrite` for why that is not always the same one.
 */
export function useWriteNote() {
  const {
    createNote: create,
    isCreating,
    error: createError,
  } = useCreateNote();
  const {
    updateNote: update,
    isUpdating,
    error: updateError,
  } = useUpdateNote();
  const {
    updateCheckInNote: updateOnCheckIn,
    isUpdating: isUpdatingCheckIn,
    error: checkInError,
  } = useUpdateCheckInNote();

  const writeNote = (
    note: DiaryNote | null,
    value: NoteDraft,
  ): Promise<unknown> => {
    const plan = planNoteWrite(note, value);

    switch (plan.kind) {
      case 'create':
        return create(plan.draft);
      case 'update':
        return update({ id: plan.id, patch: plan.patch });
      case 'updateCheckIn':
        return updateOnCheckIn({
          logId: plan.logId,
          noteId: plan.noteId,
          patch: plan.patch,
        });
    }
  };

  return {
    writeNote,
    isWriting: isCreating || isUpdating || isUpdatingCheckIn,
    error: createError ?? updateError ?? checkInError,
  };
}

/** Deletes a note through the route that owns it. */
export function useRemoveNote() {
  const { deleteNote: remove, isDeleting, error } = useDeleteNote();
  const {
    deleteCheckInNote: removeFromCheckIn,
    isDeleting: isDeletingCheckIn,
    error: checkInError,
  } = useDeleteCheckInNote();

  const removeNote = (note: DiaryNote): Promise<void> =>
    note.checkIn === null
      ? remove(note.id)
      : removeFromCheckIn({
          logId: note.checkIn.habitLogId,
          noteId: note.id,
        });

  return {
    removeNote,
    isRemoving: isDeleting || isDeletingCheckIn,
    error: error ?? checkInError,
  };
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
