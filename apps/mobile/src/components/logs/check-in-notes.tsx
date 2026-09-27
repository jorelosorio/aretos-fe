import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Plus } from '@tamagui/lucide-icons-2/icons/Plus';
import { Paragraph } from 'tamagui';

import { Card } from '@/components/common/card';
import { FormSection } from '@/components/common/form-section';
import { NoteEditor } from '@/components/diary/note-editor';
import type { NoteValue } from '@/components/diary/note-draft';
import { notePreview } from '@/components/diary/note-preview';
import { NoteMeta } from '@/components/diary/note-meta';
import { SPACING, TEXT } from '@/constants/layout';
import { useAddCheckInNote, useNoteErrorMessage } from '@/features/diary/hooks';
import { useAllowance } from '@/features/limits/hooks';
import { useLog } from '@/features/logs/hooks';
import type { NoteBody, PendingNote } from '@/features/logs/pending-notes';
import { useTranslations, type AppLocale } from '@/lib/i18n';
import { dateFormat } from '@/utils/date-format';

const PREVIEW_LINES = 3;

type Target = { kind: 'new' } | { kind: 'pending'; note: PendingNote };

type Editing = { session: number; target: Target; open: boolean };

const writtenAt = (iso: string, locale: AppLocale) =>
  dateFormat(locale, {
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
    <Card
      gap={SPACING.group}
      onPress={disabled ? undefined : onPress}
      pressable={!disabled}
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
      <NoteMeta
        caption={caption}
        captionTone={captionColor}
        tags={tags}
        collapsed
      />
    </Card>
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

    return addCheckInNote({ logId, note: { body, tags } })
      .then(onClose)
      .catch(() => undefined);
  };

  const remove = () => {
    if (target.kind !== 'pending') return;
    onRemovePending(target.note.key);
    onClose();
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
      existing={target.kind !== 'new'}
      busy={isAdding}
      error={toMessage(addError)}
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
  const router = useRouter();
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
    <FormSection
      title={t('logs.notes.title')}
      action={{
        label: t('logs.notes.add'),
        Icon: Plus,
        onPress: () => edit({ kind: 'new' }),
        disabled: !canCreate || busy,
      }}
    >
      {notes.map((note) => (
        <NoteRow
          key={note.id}
          body={note.body}
          tags={note.tags}
          caption={writtenAt(note.createdAt, locale)}
          captionColor="$mutedForeground"
          disabled={busy}
          onPress={() =>
            router.push({
              pathname: '/diary/[id]/edit',
              params: { id: note.id },
            })
          }
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
    </FormSection>
  );
}
