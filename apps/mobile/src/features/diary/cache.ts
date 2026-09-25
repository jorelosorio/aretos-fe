import type { InfiniteData } from '@tanstack/react-query';

import type { DiaryNote, DiaryPage } from './types';

/**
 * A note the diary list already holds, so the reader can paint it the moment
 * it is pushed instead of behind a spinner. Any cached list will do — the
 * note is the same object whichever filter fetched it — and the reader still
 * fetches it by id, so this is only ever a placeholder.
 */
export function findListedNote(
  lists: readonly (InfiniteData<DiaryPage> | undefined)[],
  id: string,
): DiaryNote | undefined {
  for (const list of lists) {
    for (const page of list?.pages ?? []) {
      const found = page.notes.find((note) => note.id === id);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}
