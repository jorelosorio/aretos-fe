import { useState } from 'react';
import { X } from '@tamagui/lucide-icons-2';
import { Paragraph, ScrollView, YStack } from 'tamagui';

import { FullScreenSheet } from '@/components/common/full-screen-sheet';
import { NOTE_TEXT } from '@/components/common/note-text';
import { GoalDot } from '@/components/goals/goal-dot';
import type { DiaryEntry } from '@/features/diary';
import { useTranslations } from '@/lib/i18n';

import { periodLabel } from './diary-date';

export function EntryViewer({
  entry,
  onClose,
}: {
  entry: DiaryEntry | null;
  onClose: () => void;
}) {
  const { t, locale } = useTranslations();
  const [shown, setShown] = useState(entry);

  if (entry !== null && entry !== shown) setShown(entry);

  return (
    <FullScreenSheet
      open={entry !== null}
      title={shown?.goal.name ?? ''}
      leading={
        shown === null ? undefined : <GoalDot slot={shown.goal.colorSlot} />
      }
      meta={
        shown === null
          ? ''
          : periodLabel(shown.entryDate, shown.endDate, locale)
      }
      Icon={X}
      iconLabel={t('diary.close')}
      onDismiss={onClose}
    >
      {shown !== null && (
        <ScrollView flex={1}>
          <YStack p={NOTE_TEXT.padding}>
            <Paragraph
              size={NOTE_TEXT.size}
              lineHeight={NOTE_TEXT.lineHeight}
              color="$color"
              selectable
            >
              {shown.note}
            </Paragraph>
          </YStack>
        </ScrollView>
      )}
    </FullScreenSheet>
  );
}
