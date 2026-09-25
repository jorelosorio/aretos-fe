import { useState } from 'react';
import { Alert } from 'react-native';
import { Archive, Pencil, Trash2 } from '@tamagui/lucide-icons-2';
import { Button, Paragraph, SizableText, XStack, YStack } from 'tamagui';

import { BottomSheet } from '@/components/common/bottom-sheet';
import { longDateLabel } from '@/components/common/date-label';
import { NOTE_TEXT } from '@/components/common/note-text';
import { GoalDot } from '@/components/goals/goal-dot';
import { TagChips } from '@/components/tags/tag-chips';
import { BUTTON, ICON, SPACING, TEXT } from '@/constants/layout';
import type { DiaryNote } from '@/features/diary';
import { useTranslations } from '@/lib/i18n';

import { periodLabel } from './diary-date';

export function EntryViewer({
  note,
  busy,
  onClose,
  onEdit,
  onDelete,
  onTag,
}: {
  note: DiaryNote | null;
  busy: boolean;
  onClose: () => void;
  onEdit: (note: DiaryNote) => void;
  onDelete: (note: DiaryNote) => void;
  onTag: (tag: string) => void;
}) {
  const { t, locale } = useTranslations();
  const [shown, setShown] = useState(note);

  if (note !== null && note !== shown) setShown(note);

  const checkIn = shown?.checkIn ?? null;

  const confirmDelete = (target: DiaryNote) =>
    Alert.alert(t('diary.deleteConfirm.title'), t('diary.deleteConfirm.body'), [
      { text: t('diary.deleteConfirm.cancel'), style: 'cancel' },
      {
        text: t('diary.deleteConfirm.confirm'),
        style: 'destructive',
        onPress: () => onDelete(target),
      },
    ]);

  return (
    <BottomSheet
      open={note !== null}
      title={
        shown === null
          ? ''
          : checkIn === null
            ? longDateLabel(shown.entryDate, locale)
            : checkIn.goal.name
      }
      subtitle={
        shown === null || checkIn === null
          ? undefined
          : periodLabel(shown.entryDate, checkIn.endDate, locale)
      }
      leading={
        checkIn === null ? undefined : <GoalDot slot={checkIn.goal.colorSlot} />
      }
      onDismiss={onClose}
    >
      {shown !== null && (
        <YStack gap={SPACING.section} pb={NOTE_TEXT.padding}>
          <Paragraph
            size={NOTE_TEXT.size}
            lineHeight={NOTE_TEXT.lineHeight}
            color="$color"
            selectable
          >
            {shown.body}
          </Paragraph>

          <TagChips tags={shown.tags} onPress={onTag} />

          {checkIn?.goal.archived === true ? (
            <XStack items="center" gap="$2">
              <Archive size={ICON.inline} color="$mutedForeground" />
              <SizableText
                flex={1}
                size={TEXT.caption}
                color="$mutedForeground"
              >
                {t('diary.viewer.archived')}
              </SizableText>
            </XStack>
          ) : (
            <XStack gap={SPACING.items}>
              <Button
                flex={1}
                size={BUTTON.compact}
                bg="$card"
                borderColor="$border"
                disabled={busy}
                onPress={() => onEdit(shown)}
                icon={<Pencil size={ICON.row} color="$color" />}
              >
                <SizableText size={TEXT.body} fontWeight="700" color="$color">
                  {t('diary.viewer.edit')}
                </SizableText>
              </Button>

              <Button
                flex={1}
                size={BUTTON.compact}
                bg="$card"
                borderColor="$border"
                disabled={busy}
                onPress={() => confirmDelete(shown)}
                icon={<Trash2 size={ICON.row} color="$destructive" />}
              >
                <SizableText
                  size={TEXT.body}
                  fontWeight="700"
                  color="$destructive"
                >
                  {t('diary.viewer.delete')}
                </SizableText>
              </Button>
            </XStack>
          )}
        </YStack>
      )}
    </BottomSheet>
  );
}
