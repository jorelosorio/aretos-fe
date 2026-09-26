import { useState } from 'react';

import { useTagDraft } from '@/components/tags/tag-draft';
import type { DateKey } from '@/features/logs';
import { sameTags } from '@/features/tags';

/**
 * What the note form edits. `entryDate` is null for a check-in's note: its
 * day is the check-in's, and the form shows it rather than offering to move it.
 */
export type NoteValue = {
  body: string;
  tags: string[];
  entryDate: DateKey | null;
};

/**
 * Whether saving would change anything. Tags compare the way the server
 * dedupes them — case-insensitively — so retyping "health" over "Health"
 * is not an edit worth a Save or a discard prompt.
 */
export function noteChanged(value: NoteValue, initial: NoteValue): boolean {
  return (
    value.body !== initial.body ||
    !sameTags(value.tags, initial.tags) ||
    value.entryDate !== initial.entryDate
  );
}

/**
 * The form's state, shared by the pushed diary editor and the check-in's
 * sheet so both save exactly the same thing.
 */
export function useNoteDraft(initial: NoteValue) {
  const [body, setBody] = useState(initial.body);
  const tags = useTagDraft(initial.tags);
  const [entryDate, setEntryDate] = useState(initial.entryDate);

  const value: NoteValue = {
    body: body.trim(),
    tags: tags.value,
    entryDate,
  };
  const dirty = noteChanged({ ...value, body }, initial);

  return {
    body,
    setBody,
    tags,
    entryDate,
    setEntryDate,
    value,
    dirty,
    filled: value.body !== '',
  };
}
