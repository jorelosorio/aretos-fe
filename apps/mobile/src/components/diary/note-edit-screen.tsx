import { useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { Stack, useNavigation, useRouter } from 'expo-router';
import { ArrowLeft, ChevronLeft } from '@tamagui/lucide-icons-2';

import { ErrorNotice } from '@/components/common/error-notice';
import {
  HeaderIconButton,
  HeaderTextButton,
} from '@/components/common/header-actions';
import { ScreenLoader } from '@/components/common/screen-loader';
import {
  useNote,
  useNoteErrorMessage,
  useWriteNote,
  type DiaryNote,
} from '@/features/diary';
import { todayKey } from '@/features/logs';
import { runExclusive } from '@/lib/exclusive';
import { useTranslations } from '@/lib/i18n';

import { periodLabel } from './diary-date';
import { useNoteDraft, type NoteValue } from './note-draft';
import { NoteForm } from './note-form';

const BackIcon = Platform.OS === 'ios' ? ChevronLeft : ArrowLeft;

function NoteEditForm({ note }: { note: DiaryNote | null }) {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const navigation = useNavigation();
  const toMessage = useNoteErrorMessage();
  const { writeNote, isWriting, error } = useWriteNote();

  const checkIn = note?.checkIn ?? null;
  const [initial] = useState<NoteValue>(() => ({
    body: note?.body ?? '',
    tags: note?.tags ?? [],
    entryDate: checkIn === null ? (note?.entryDate ?? todayKey()) : null,
  }));
  const draft = useNoteDraft(initial);
  const submitting = useRef(false);
  const leaving = useRef(false);

  const guarded = draft.dirty && !isWriting;
  const canSave = draft.dirty && draft.filled && !isWriting;

  useEffect(() => {
    if (!guarded) return;

    return navigation.addListener('beforeRemove', (event) => {
      if (leaving.current) return;
      event.preventDefault();

      Alert.alert(
        t('diary.editor.discardTitle'),
        t('diary.editor.discardBody'),
        [
          { text: t('diary.editor.keepEditing'), style: 'cancel' },
          {
            text: t('diary.editor.discard'),
            style: 'destructive',
            onPress: () => {
              leaving.current = true;
              navigation.dispatch(event.data.action);
            },
          },
        ],
      );
    });
  }, [guarded, navigation, t]);

  const save = () => {
    const { body, tags, entryDate } = draft.value;

    void runExclusive(submitting, () =>
      writeNote(note, {
        entryDate: entryDate ?? note?.entryDate ?? todayKey(),
        body,
        tags,
      })
        .then(() => {
          leaving.current = true;
          router.back();
        })
        .catch(() => undefined),
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title:
            note === null
              ? t('diary.editor.newTitle')
              : checkIn === null
                ? t('diary.editor.editTitle')
                : checkIn.goal.name,
          gestureEnabled: !guarded,
          headerBackVisible: false,
          headerLeft: () => (
            <HeaderIconButton
              Icon={BackIcon}
              label={t('diary.editor.back')}
              onPress={() => router.back()}
              disabled={isWriting}
            />
          ),
          headerRight: () => (
            <HeaderTextButton
              label={t('diary.editor.save')}
              onPress={save}
              disabled={!canSave}
              busy={isWriting}
            />
          ),
        }}
      />

      <NoteForm
        draft={draft}
        period={
          note === null || checkIn === null
            ? undefined
            : periodLabel(note.entryDate, checkIn.endDate, locale)
        }
        error={toMessage(error)}
        autoFocus={note === null}
      />
    </>
  );
}

export function NewNoteScreen() {
  return <NoteEditForm note={null} />;
}

export function EditNoteScreen({ id }: { id: string }) {
  const toMessage = useNoteErrorMessage();
  const { data: note, error, isPlaceholderData } = useNote(id);

  if (!note && error) return <ErrorNotice message={toMessage(error)} />;
  if (!note || isPlaceholderData) return <ScreenLoader />;

  return <NoteEditForm note={note} />;
}
