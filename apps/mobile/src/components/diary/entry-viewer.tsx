import { X } from '@tamagui/lucide-icons-2';
import { Paragraph, ScrollView, YStack } from 'tamagui';

import { FullScreenSheet } from '@/components/common/full-screen-sheet';
import { SPACING } from '@/constants/layout';
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
          : periodLabel(entry.entryDate, entry.goal.trackingFrequency, locale)
      }
      Icon={X}
      iconLabel={t('diary.close')}
      onDismiss={onClose}
    >
      {entry !== null && (
        <ScrollView flex={1}>
          <YStack p={SPACING.screen}>
            <Paragraph size="$5" color="$color" selectable>
              {entry.note}
            </Paragraph>
          </YStack>
        </ScrollView>
      )}
    </FullScreenSheet>
  );
}
