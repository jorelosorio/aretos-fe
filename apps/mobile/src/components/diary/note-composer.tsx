import {
  useNoteErrorMessage,
  useWriteNote,
  type DiaryNote,
} from '@/features/diary';
import { todayKey } from '@/features/logs';
import { useTranslations } from '@/lib/i18n';

import { periodLabel } from './diary-date';
import { NoteEditor, type NoteEditorValue } from './note-editor';

export function NoteComposer({
  note,
  open,
  onClose,
}: {
  note: DiaryNote | null;
  open: boolean;
  onClose: () => void;
}) {
  const { t, locale } = useTranslations();
  const toMessage = useNoteErrorMessage();
  const { writeNote, isWriting, error } = useWriteNote();

  const today = todayKey();
  const checkIn = note?.checkIn ?? null;

  const save = (value: NoteEditorValue) =>
    writeNote(note, {
      entryDate: value.entryDate ?? note?.entryDate ?? today,
      body: value.body,
      tags: value.tags,
    })
      .then(onClose)
      .catch(() => undefined);

  return (
    <NoteEditor
      open={open}
      title={
        note === null
          ? t('diary.editor.newTitle')
          : checkIn === null
            ? t('diary.editor.editTitle')
            : checkIn.goal.name
      }
      subtitle={
        note === null || checkIn === null
          ? undefined
          : periodLabel(note.entryDate, checkIn.endDate, locale)
      }
      initial={{
        body: note?.body ?? '',
        tags: note?.tags ?? [],
        entryDate: checkIn === null ? (note?.entryDate ?? today) : null,
      }}
      maxDate={today}
      busy={isWriting}
      error={toMessage(error)}
      onSave={save}
      onDismiss={onClose}
    />
  );
}
