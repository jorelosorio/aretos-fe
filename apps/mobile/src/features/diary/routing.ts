import type { DiaryNote, NoteDraft, NotePatch } from './types';

/**
 * Which change saving the editor is, decided in one place.
 *
 * A new note is a create. An edit sends only what an edit may change: a
 * check-in's note sits on its period's day, which the server refuses to
 * move, so its edit never carries a day; a note written on its own sends
 * its day only when it moved, so an edit to the words alone is not also a
 * write to the date.
 */
export type NoteWritePlan =
  | { kind: 'create'; draft: NoteDraft }
  | { kind: 'update'; id: string; patch: NotePatch };

export function planNoteWrite(
  note: DiaryNote | null,
  value: NoteDraft,
): NoteWritePlan {
  if (note === null) return { kind: 'create', draft: value };

  const movesDay = note.checkIn === null && value.entryDate !== note.entryDate;

  return {
    kind: 'update',
    id: note.id,
    patch: {
      body: value.body,
      tags: value.tags,
      ...(movesDay ? { entryDate: value.entryDate } : {}),
    },
  };
}
