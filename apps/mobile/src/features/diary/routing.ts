import type {
  CheckInNotePatch,
  DiaryNote,
  NoteDraft,
  NotePatch,
} from './types';

/**
 * Which request an edit is, decided in one place.
 *
 * A check-in's note could be patched through `/v1/diary-notes` too, but its
 * day is the period's and the server refuses to move it, so it goes through
 * its own log's route with the day never in the body. A note written on its
 * own sends its day only when it moved, so an edit to the words alone is not
 * also a write to the date.
 */
export type NoteWritePlan =
  | { kind: 'create'; draft: NoteDraft }
  | { kind: 'update'; id: string; patch: NotePatch }
  | {
      kind: 'updateCheckIn';
      logId: string;
      noteId: string;
      patch: CheckInNotePatch;
    };

export function planNoteWrite(
  note: DiaryNote | null,
  value: NoteDraft,
): NoteWritePlan {
  if (note === null) return { kind: 'create', draft: value };

  if (note.checkIn !== null) {
    return {
      kind: 'updateCheckIn',
      logId: note.checkIn.habitLogId,
      noteId: note.id,
      patch: { body: value.body, tags: value.tags },
    };
  }

  return {
    kind: 'update',
    id: note.id,
    patch: {
      body: value.body,
      tags: value.tags,
      ...(value.entryDate === note.entryDate
        ? {}
        : { entryDate: value.entryDate }),
    },
  };
}
