import type { DiaryNote } from '@/features/diary';

import { monthKey } from './diary-date';

export type DiaryRow =
  | { kind: 'month'; key: string; month: string }
  | { kind: 'note'; key: string; note: DiaryNote };

/**
 * The diary's list rows: each note, with a month heading wherever the month
 * changes.
 *
 * The server orders by when a note was written (a check-in's note by when
 * its check-in was), not by the day it is about, so a note dated yesterday
 * and written today sits above older ones. A month can therefore come back
 * further down, and it gets its heading again there. The heading's key
 * carries its position for that reason — keyed by the month alone, two
 * headings for September collide in the list.
 */
export function toRows(notes: readonly DiaryNote[]): DiaryRow[] {
  const rows: DiaryRow[] = [];
  let month: string | null = null;

  for (const note of notes) {
    const key = monthKey(note.entryDate);

    if (key !== month) {
      month = key;
      rows.push({
        kind: 'month',
        key: `month:${key}:${rows.length}`,
        month: key,
      });
    }
    rows.push({ kind: 'note', key: note.id, note });
  }

  return rows;
}
