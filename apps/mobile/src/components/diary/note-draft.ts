import { useState } from 'react';

import type { DateKey } from '@/features/logs';
import { addTag, sameTags } from '@/features/tags';

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
 *
 * A tag typed but not yet confirmed is part of `value`: pressing Save is as
 * clear a "yes" as pressing Return, and dropping the text silently would lose
 * what the person just wrote.
 */
export function useNoteDraft(initial: NoteValue) {
  const [body, setBody] = useState(initial.body);
  const [tags, setTags] = useState<string[]>([...initial.tags]);
  const [tagText, setTagText] = useState('');
  const [entryDate, setEntryDate] = useState(initial.entryDate);

  const value: NoteValue = {
    body: body.trim(),
    tags: addTag(tags, tagText),
    entryDate,
  };
  const dirty = noteChanged({ ...value, body }, initial);

  return {
    body,
    setBody,
    tags,
    setTags,
    tagText,
    setTagText,
    entryDate,
    setEntryDate,
    value,
    dirty,
    filled: value.body !== '',
  };
}
