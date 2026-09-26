import { Archive, ChevronRight } from '@tamagui/lucide-icons-2';
import { Paragraph, SizableText, XStack, YStack } from 'tamagui';

import { GoalDot } from '@/components/goals/goal-dot';
import { slotColor } from '@/components/goals/slot-color';
import { MOOD_LABELS } from '@/components/logs/mood-labels';
import { PeriodMood } from '@/components/logs/period-mood';
import { TagChips } from '@/components/tags/tag-chips';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { DiaryNote } from '@/features/diary';
import { useTranslations } from '@/lib/i18n';

import { periodLabel } from './diary-date';
import { notePreview } from './note-preview';

const NOTE_LINES = 4;
const MOOD_FACE = 22;
const TAG_PREVIEW = 3;
const TINT_OPACITY = 0.1;

export function DiaryEntryCard({
  note,
  onPress,
}: {
  note: DiaryNote;
  onPress: () => void;
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
    <XStack
      onPress={onPress}
      pressStyle={{ bg: '$cardPress' }}
      items="center"
      gap={SPACING.items}
      p={SPACING.card}
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
      overflow="hidden"
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
            <XStack flex={1} minW={0} items="center" gap="$1.5">
              <GoalDot slot={checkIn.goal.colorSlot} size={8} />
              <SizableText
                shrink={1}
                size={TEXT.body}
                fontWeight="700"
                color="$cardForeground"
                numberOfLines={1}
              >
                {checkIn.goal.name}
              </SizableText>
              {checkIn.goal.archived && (
                <Archive size={ICON.inline} color="$mutedForeground" />
              )}
            </XStack>

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

        <SizableText
          size={TEXT.caption}
          color="$mutedForeground"
          numberOfLines={1}
        >
          {when}
        </SizableText>

        <TagChips tags={note.tags} max={TAG_PREVIEW} />
      </YStack>

      <ChevronRight size={ICON.row} color="$mutedForeground" />
    </XStack>
  );
}
