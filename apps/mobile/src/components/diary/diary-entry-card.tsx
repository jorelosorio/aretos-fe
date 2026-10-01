import { memo } from 'react';
import { Paragraph, XStack, YStack } from 'tamagui';

import { Card } from '@/components/common/card';
import { GoalName } from '@/components/goals/goal-name';
import { slotColor } from '@/components/goals/slot-color';
import { MOOD_LABELS } from '@/components/logs/mood-labels';
import { PeriodMood } from '@/components/logs/period-mood';
import { SPACING, TEXT } from '@/constants/layout';
import type { DiaryNote } from '@/features/diary/types';
import { useTranslations } from '@/lib/i18n';

import { periodLabel } from './diary-date';
import { NoteMeta } from './note-meta';
import { NoteSyncStatus } from './note-sync-status';
import { notePreview } from './note-preview';

const NOTE_LINES = 4;
const MOOD_FACE = 22;
const TINT_OPACITY = 0.1;

export const DiaryEntryCard = memo(function DiaryEntryCard({
  note,
  onOpen,
}: {
  note: DiaryNote;
  onOpen: (note: DiaryNote) => void;
}) {
  const { t, locale } = useTranslations();

  const { checkIn } = note;
  const mood = checkIn?.mood ?? null;
  const when = periodLabel(
    note.entryDate,
    checkIn?.endDate ?? note.entryDate,
    locale,
  );
  const preview = notePreview(note.body);

  const label = [
    checkIn?.goal.name ?? null,
    mood === null ? null : t(MOOD_LABELS[mood]),
    preview,
    note.tags.length === 0 ? null : note.tags.join(', '),
    when,
  ]
    .filter((part): part is string => part !== null && part !== '')
    .join('. ');

  return (
    <Card
      row
      pressable
      items="center"
      overflow="hidden"
      onPress={() => onOpen(note)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={t('diary.entry.readHint')}
    >
      {checkIn !== null && (
        <YStack
          position="absolute"
          t={0}
          r={0}
          b={0}
          l={0}
          bg={slotColor(checkIn.goal.colorSlot)}
          opacity={TINT_OPACITY}
          pointerEvents="none"
        />
      )}

      <YStack flex={1} minW={0} gap={SPACING.group}>
        {checkIn !== null && (
          <XStack items="center" gap={SPACING.items}>
            <GoalName
              variant="inline"
              slot={checkIn.goal.colorSlot}
              name={checkIn.goal.name}
              lines={1}
              archived={checkIn.goal.archived}
            />

            <PeriodMood mood={mood} size={MOOD_FACE} active />
          </XStack>
        )}

        <Paragraph
          size={TEXT.body}
          color="$cardForeground"
          numberOfLines={NOTE_LINES}
          ellipsizeMode="tail"
        >
          {preview}
        </Paragraph>

        <NoteMeta caption={when} tags={note.tags} collapsed />

        <NoteSyncStatus note={note} />
      </YStack>
    </Card>
  );
});
