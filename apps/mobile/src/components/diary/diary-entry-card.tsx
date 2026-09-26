import { Archive, ChevronRight } from '@tamagui/lucide-icons-2';
import { Paragraph, SizableText, XStack, YStack } from 'tamagui';

import { CompletionStatus } from '@/components/goals/completion-status';
import { GoalDot } from '@/components/goals/goal-dot';
import { MOOD_LABELS } from '@/components/logs/mood-labels';
import { PeriodMood } from '@/components/logs/period-mood';
import { TagChips } from '@/components/tags/tag-chips';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { DiaryNote } from '@/features/diary';
import { useTranslations } from '@/lib/i18n';

import { periodLabel } from './diary-date';
import { notePreview } from './note-preview';

const NOTE_LINES = 3;
const MOOD_FACE = 24;
const TAG_PREVIEW = 3;

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
    mood === null ? null : t(MOOD_LABELS[mood]),
    preview,
    checkIn?.goal.name ?? null,
    when,
    note.tags.length === 0 ? null : note.tags.join(', '),
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
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={t('diary.entry.readHint')}
    >
      <YStack flex={1} minW={0} gap={SPACING.text}>
        <Paragraph
          size={TEXT.body}
          color="$cardForeground"
          numberOfLines={NOTE_LINES}
          ellipsizeMode="tail"
        >
          {preview}
        </Paragraph>

        <XStack items="center" gap="$1.5">
          {checkIn !== null && (
            <>
              <GoalDot slot={checkIn.goal.colorSlot} size={8} />
              <SizableText
                shrink={1}
                size={TEXT.caption}
                fontWeight="600"
                color="$cardForeground"
                numberOfLines={1}
              >
                {checkIn.goal.name}
              </SizableText>
              {checkIn.goal.archived && (
                <Archive size={ICON.inline} color="$mutedForeground" />
              )}
              <SizableText size={TEXT.caption} color="$mutedForeground">
                ·
              </SizableText>
            </>
          )}

          <SizableText
            shrink={1}
            size={TEXT.caption}
            color="$mutedForeground"
            numberOfLines={1}
          >
            {when}
          </SizableText>
        </XStack>

        {checkIn !== null && checkIn.total > 0 && (
          <CompletionStatus
            status={checkIn.status}
            answered={checkIn.answered}
            total={checkIn.total}
          />
        )}

        <TagChips tags={note.tags} max={TAG_PREVIEW} />
      </YStack>

      {checkIn !== null && <PeriodMood mood={mood} size={MOOD_FACE} active />}

      <ChevronRight size={ICON.row} color="$mutedForeground" />
    </XStack>
  );
}
