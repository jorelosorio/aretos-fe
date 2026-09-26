import { useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { ArrowLeft, ChevronLeft, Trash2 } from '@tamagui/lucide-icons-2';

import { FullScreenSheet } from '@/components/common/full-screen-sheet';
import {
  HeaderIconButton,
  HeaderTextButton,
} from '@/components/common/header-actions';
import { runExclusive } from '@/lib/exclusive';
import { useTranslations } from '@/lib/i18n';

import { useNoteDraft, type NoteValue } from './note-draft';
import { NoteForm } from './note-form';

const BackIcon = Platform.OS === 'ios' ? ChevronLeft : ArrowLeft;

export function NoteEditor({
  open,
  title,
  period,
  initial,
  busy,
  error,
  onSave,
  onDelete,
  onDismiss,
}: {
  open: boolean;
  title: string;
  period?: string;
  initial: NoteValue;
  busy: boolean;
  error: string | null;
  onSave: (value: NoteValue) => Promise<unknown> | void;
  onDelete?: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslations();
  const draft = useNoteDraft(initial);
  const submitting = useRef(false);

  const canSave = open && draft.dirty && draft.filled && !busy;

  const submit = () => {
    void runExclusive(submitting, async () => {
      await onSave(draft.value);
    });
  };

  const dismiss = () => {
    if (!draft.dirty || busy) {
      onDismiss();
      return;
    }

    Alert.alert(t('diary.editor.discardTitle'), t('diary.editor.discardBody'), [
      { text: t('diary.editor.keepEditing'), style: 'cancel' },
      {
        text: t('diary.editor.discard'),
        style: 'destructive',
        onPress: onDismiss,
      },
    ]);
  };

  const confirmDelete = () => {
    if (onDelete === undefined) return;

    Alert.alert(t('diary.deleteConfirm.title'), t('diary.deleteConfirm.body'), [
      { text: t('diary.deleteConfirm.cancel'), style: 'cancel' },
      {
        text: t('diary.deleteConfirm.confirm'),
        style: 'destructive',
        onPress: onDelete,
      },
    ]);
  };

  return (
    <FullScreenSheet
      open={open}
      title={title}
      meta=""
      Icon={BackIcon}
      iconLabel={t('diary.editor.back')}
      onDismiss={dismiss}
      actions={
        <>
          {onDelete !== undefined && (
            <HeaderIconButton
              Icon={Trash2}
              label={t('diary.editor.delete')}
              onPress={confirmDelete}
              disabled={busy}
            />
          )}
          <HeaderTextButton
            label={t('diary.editor.save')}
            onPress={submit}
            disabled={!canSave}
            busy={busy}
          />
        </>
      }
    >
      <NoteForm
        draft={draft}
        period={period}
        error={error}
        autoFocus={initial.body === ''}
        padBottom={false}
      />
    </FullScreenSheet>
  );
}
