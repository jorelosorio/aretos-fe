import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '@tamagui/core';
import { Trash2, X } from '@tamagui/lucide-icons-2';
import { SizableText, TextArea, YStack, type ColorTokens } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { FullScreenSheet } from '@/components/common/full-screen-sheet';
import {
  HeaderIconButton,
  HeaderTextButton,
} from '@/components/common/header-actions';
import { NOTE_TEXT } from '@/components/common/note-text';
import { TagInput } from '@/components/tags/tag-input';
import { SPACING, TEXT } from '@/constants/layout';
import { NOTE_BODY_MAX } from '@/features/diary';
import type { DateKey } from '@/features/logs';
import { addTag, sameTags } from '@/features/tags';
import { runExclusive } from '@/lib/exclusive';
import { useTranslations } from '@/lib/i18n';

import { DayStepper } from './day-stepper';

export type NoteEditorValue = {
  body: string;
  tags: string[];
  entryDate: DateKey | null;
};

export function NoteEditor({
  open,
  title,
  subtitle,
  initial,
  maxDate,
  busy,
  error,
  onSave,
  onDelete,
  onDismiss,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  initial: NoteEditorValue;
  maxDate: DateKey;
  busy: boolean;
  error: string | null;
  onSave: (value: NoteEditorValue) => Promise<unknown> | void;
  onDelete?: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslations();
  const theme = useTheme();

  const [body, setBody] = useState(initial.body);
  const [tags, setTags] = useState<string[]>([...initial.tags]);
  const [tagText, setTagText] = useState('');
  const [entryDate, setEntryDate] = useState(initial.entryDate);
  const submitting = useRef(false);

  const finalTags = addTag(tags, tagText);
  const dirty =
    body !== initial.body ||
    !sameTags(finalTags, initial.tags) ||
    entryDate !== initial.entryDate;
  const canSave = open && dirty && body.trim() !== '' && !busy;

  const submit = () => {
    void runExclusive(submitting, async () => {
      await onSave({ body: body.trim(), tags: finalTags, entryDate });
    });
  };

  const dismiss = () => {
    if (!dirty || busy) {
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
      meta={`${body.length} / ${NOTE_BODY_MAX}`}
      Icon={X}
      iconLabel={t('diary.editor.close')}
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {entryDate !== null && (
          <DayStepper value={entryDate} max={maxDate} onChange={setEntryDate} />
        )}

        {entryDate === null && subtitle !== undefined && (
          <SizableText
            px={SPACING.screen}
            pb={SPACING.group}
            size={TEXT.caption}
            color="$mutedForeground"
          >
            {subtitle}
          </SizableText>
        )}

        {error !== null && (
          <YStack px={SPACING.screen} pb={SPACING.group}>
            <ErrorNotice message={error} />
          </YStack>
        )}

        <TextArea
          flex={1}
          size={NOTE_TEXT.size}
          lineHeight={NOTE_TEXT.lineHeight}
          color={theme.color.val as ColorTokens}
          value={body}
          onChangeText={setBody}
          placeholder={t('diary.editor.placeholder')}
          placeholderTextColor={theme.mutedForeground.val as ColorTokens}
          maxLength={NOTE_BODY_MAX}
          multiline
          autoFocus={initial.body === ''}
          verticalAlign="top"
          p={NOTE_TEXT.padding}
          bg={theme.background.val as ColorTokens}
          borderWidth={0}
          focusStyle={{
            borderWidth: 0,
            bg: theme.background.val as ColorTokens,
          }}
        />

        <YStack
          px={SPACING.screen}
          py={SPACING.items}
          borderTopWidth={1}
          borderColor="$border"
        >
          <TagInput
            value={tags}
            onChange={setTags}
            text={tagText}
            onTextChange={setTagText}
          />
        </YStack>
      </KeyboardAvoidingView>
    </FullScreenSheet>
  );
}
