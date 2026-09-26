import { useRef, useState } from 'react';
import { Plus } from '@tamagui/lucide-icons-2';
import { Button, Paragraph, SizableText, YStack } from 'tamagui';

import { SectionTitle } from '@/components/common/section-title';
import { NoteEditor } from '@/components/diary/note-editor';
import type { NoteValue } from '@/components/diary/note-draft';
import { notePreview } from '@/components/diary/note-preview';
import { TagChips } from '@/components/tags/tag-chips';
import { BUTTON, ICON, SPACING, TEXT } from '@/constants/layout';
import {
  useAddCheckInNote,
  useDeleteCheckInNote,
  useNoteErrorMessage,
  useUpdateCheckInNote,
  type CheckInNote,
} from '@/features/diary';
import { useAllowance } from '@/features/limits';
import { useLog, type NoteBody, type PendingNote } from '@/features/logs';
import { useTranslations, type AppLocale } from '@/lib/i18n';

const PREVIEW_LINES = 3;
const TAG_PREVIEW = 3;

type Target =
  | { kind: 'new' }
  | { kind: 'saved'; note: CheckInNote }
  | { kind: 'pending'; note: PendingNote };

type Editing = { session: number; target: Target; open: boolean };

const writtenAt = (iso: string, locale: AppLocale) =>
  new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));

function NoteRow({
  body,
  tags,
  caption,
  captionColor,
  disabled,
  onPress,
}: {
  body: string;
  tags: readonly string[];
  caption: string;
  captionColor: '$mutedForeground' | '$destructive';
  disabled: boolean;
  onPress: () => void;
}) {
  const preview = notePreview(body);

  return (
    <YStack
      gap={SPACING.group}
      p={SPACING.card}
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
      onPress={disabled ? undefined : onPress}
      pressStyle={disabled ? undefined : { bg: '$cardPress' }}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={`${preview}. ${caption}`}
    >
      <Paragraph
        size={TEXT.body}
        color="$cardForeground"
        numberOfLines={PREVIEW_LINES}
        ellipsizeMode="tail"
      >
        {preview}
      </Paragraph>
      <TagChips tags={tags} max={TAG_PREVIEW} />
      <SizableText size={TEXT.caption} color={captionColor}>
        {caption}
      </SizableText>
    </YStack>
  );
}

function CheckInNoteComposer({
  logId,
  target,
  open,
  title,
  subtitle,
  onAddPending,
  onUpdatePending,
  onRemovePending,
  onClose,
}: {
  logId: string | null;
  target: Target;
  open: boolean;
  title: string;
  subtitle: string;
  onAddPending: (note: NoteBody) => void;
  onUpdatePending: (key: string, note: NoteBody) => void;
  onRemovePending: (key: string) => void;
  onClose: () => void;
}) {
  const toMessage = useNoteErrorMessage();
  const { addCheckInNote, isAdding, error: addError } = useAddCheckInNote();
  const {
    updateCheckInNote,
    isUpdating,
    error: updateError,
  } = useUpdateCheckInNote();
  const {
    deleteCheckInNote,
    isDeleting,
    error: deleteError,
  } = useDeleteCheckInNote();

  const save = ({ body, tags }: NoteValue) => {
    if (target.kind === 'pending') {
      onUpdatePending(target.note.key, { body, tags });
      onClose();
      return;
    }
    if (logId === null) {
      onAddPending({ body, tags });
      onClose();
      return;
    }

    const request =
      target.kind === 'saved'
        ? updateCheckInNote({
            logId,
            noteId: target.note.id,
            patch: { body, tags },
          })
        : addCheckInNote({ logId, note: { body, tags } });

    return request.then(onClose).catch(() => undefined);
  };

  const remove = () => {
    if (target.kind === 'pending') {
      onRemovePending(target.note.key);
      onClose();
      return;
    }
    if (target.kind !== 'saved' || logId === null) return;

    void deleteCheckInNote({ logId, noteId: target.note.id })
      .then(onClose)
      .catch(() => undefined);
  };

  return (
    <NoteEditor
      open={open}
      title={title}
      period={subtitle}
      initial={{
        body: target.kind === 'new' ? '' : target.note.body,
        tags: target.kind === 'new' ? [] : target.note.tags,
        entryDate: null,
      }}
      busy={isAdding || isUpdating || isDeleting}
      error={toMessage(addError ?? updateError ?? deleteError)}
      onSave={save}
      onDelete={target.kind === 'new' ? undefined : remove}
      onDismiss={onClose}
    />
  );
}

export function CheckInNotes({
  logId,
  title,
  subtitle,
  pending,
  onAddPending,
  onUpdatePending,
  onRemovePending,
  busy,
}: {
  logId: string | null;
  title: string;
  subtitle: string;
  pending: readonly PendingNote[];
  onAddPending: (note: NoteBody) => void;
  onUpdatePending: (key: string, note: NoteBody) => void;
  onRemovePending: (key: string) => void;
  busy: boolean;
}) {
  const { t, locale } = useTranslations();
  const toMessage = useNoteErrorMessage();
  const { canCreate } = useAllowance('diary_note');
  const { data: log } = useLog(logId);

  const [editing, setEditing] = useState<Editing | null>(null);
  const sessions = useRef(0);

  const notes = logId === null ? [] : (log?.notes ?? []);

  const edit = (target: Target) => {
    sessions.current += 1;
    setEditing({ session: sessions.current, target, open: true });
  };

  return (
    <YStack gap={SPACING.group}>
      <SectionTitle>{t('logs.notes.title')}</SectionTitle>

      {notes.map((note) => (
        <NoteRow
          key={note.id}
          body={note.body}
          tags={note.tags}
          caption={writtenAt(note.createdAt, locale)}
          captionColor="$mutedForeground"
          disabled={busy}
          onPress={() => edit({ kind: 'saved', note })}
        />
      ))}

      {pending.map((note) => (
        <NoteRow
          key={note.key}
          body={note.body}
          tags={note.tags}
          caption={
            note.failed
              ? (toMessage(note.error) ?? t('logs.notes.failed'))
              : t('logs.notes.pending')
          }
          captionColor={note.failed ? '$destructive' : '$mutedForeground'}
          disabled={busy}
          onPress={() => edit({ kind: 'pending', note })}
        />
      ))}

      <Button
        self="flex-start"
        size={BUTTON.compact}
        chromeless
        disabled={!canCreate || busy}
        opacity={canCreate && !busy ? 1 : 0.4}
        onPress={() => edit({ kind: 'new' })}
        icon={<Plus size={ICON.row} color="$primary" />}
      >
        <SizableText size={TEXT.body} fontWeight="700" color="$primary">
          {t('logs.notes.add')}
        </SizableText>
      </Button>

      {editing !== null && (
        <CheckInNoteComposer
          key={editing.session}
          logId={logId}
          target={editing.target}
          open={editing.open}
          title={title}
          subtitle={subtitle}
          onAddPending={onAddPending}
          onUpdatePending={onUpdatePending}
          onRemovePending={onRemovePending}
          onClose={() =>
            setEditing((current) =>
              current === null ? null : { ...current, open: false },
            )
          }
        />
      )}
    </YStack>
  );
}
