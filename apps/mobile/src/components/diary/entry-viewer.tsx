import { X } from '@tamagui/lucide-icons-2';
import { Paragraph, ScrollView, YStack } from 'tamagui';

import { FullScreenSheet } from '@/components/common/full-screen-sheet';
import { NOTE_TEXT } from '@/components/common/note-text';
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

  return (
    <FullScreenSheet
      open={entry !== null}
      title={entry?.goal.name ?? ''}
      meta={
        entry === null
          ? ''
          : periodLabel(entry.entryDate, entry.endDate, locale)
      }
      Icon={X}
      iconLabel={t('diary.close')}
      onDismiss={onClose}
    >
      {entry !== null && (
        <ScrollView flex={1}>
          <YStack p={NOTE_TEXT.padding}>
            <Paragraph
              size={NOTE_TEXT.size}
              lineHeight={NOTE_TEXT.lineHeight}
              color="$color"
              selectable
            >
              {entry.note}
            </Paragraph>
          </YStack>
        </ScrollView>
      )}
    </FullScreenSheet>
  );
}
