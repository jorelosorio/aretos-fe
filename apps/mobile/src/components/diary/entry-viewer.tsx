import { useState } from 'react';
import { Paragraph, YStack } from 'tamagui';

import { BottomSheet } from '@/components/common/bottom-sheet';
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
  const { locale } = useTranslations();
  const [shown, setShown] = useState(entry);

  if (entry !== null && entry !== shown) setShown(entry);

  return (
    <BottomSheet
      open={entry !== null}
      title={shown?.goal.name ?? ''}
      subtitle={
        shown === null
          ? undefined
          : periodLabel(shown.entryDate, shown.endDate, locale)
      }
      leading={
        shown === null ? undefined : <GoalDot slot={shown.goal.colorSlot} />
      }
      onDismiss={onClose}
    >
      {shown !== null && (
        <YStack pb={NOTE_TEXT.padding}>
          <Paragraph
            size={NOTE_TEXT.size}
            lineHeight={NOTE_TEXT.lineHeight}
            color="$color"
            selectable
          >
            {shown.note}
          </Paragraph>
        </YStack>
      )}
    </BottomSheet>
  );
}
