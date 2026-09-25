import { Archive, BookOpen } from '@tamagui/lucide-icons-2';
import { Paragraph, Separator, SizableText, XStack, YStack } from 'tamagui';

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

const NOTE_LINES = 4;
const MOOD_FACE = 28;
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
    <YStack
      onPress={onPress}
      pressStyle={{ bg: '$cardPress' }}
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
      overflow="hidden"
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={t('diary.entry.readHint')}
    >
      <XStack items="flex-start" gap={SPACING.group} p={SPACING.card}>
        <YStack flex={1} minW={0} gap={SPACING.group}>
          <Paragraph
            size={TEXT.body}
            color="$cardForeground"
            numberOfLines={NOTE_LINES}
            ellipsizeMode="tail"
          >
            {preview}
          </Paragraph>

          <TagChips tags={note.tags} max={TAG_PREVIEW} />
        </YStack>

        {checkIn !== null && <PeriodMood mood={mood} size={MOOD_FACE} active />}
      </XStack>

      <Separator borderColor="$border" />

      <XStack
        items="center"
        gap={SPACING.items}
        px={SPACING.card}
        py={SPACING.items}
      >
        <YStack flex={1} minW={0} gap={SPACING.text}>
          <XStack items="center" gap="$1.5">
            {checkIn !== null && (
              <>
                <GoalDot slot={checkIn.goal.colorSlot} size={8} />
                <SizableText
                  shrink={1}
                  size={TEXT.caption}
                  color="$mutedForeground"
                  numberOfLines={1}
                >
                  {checkIn.goal.name}
                </SizableText>

                {checkIn.goal.archived && (
                  <Archive size={ICON.inline} color="$mutedForeground" />
                )}
              </>
            )}

            <SizableText
              size={TEXT.caption}
              color="$mutedForeground"
              numberOfLines={1}
            >
              {checkIn === null ? when : `· ${when}`}
            </SizableText>
          </XStack>

          {checkIn !== null && checkIn.total > 0 && (
            <CompletionStatus
              status={checkIn.status}
              answered={checkIn.answered}
              total={checkIn.total}
            />
          )}
        </YStack>

        <XStack items="center" gap="$1.5">
          <BookOpen size={ICON.row} color="$primary" />
          <SizableText size={TEXT.body} fontWeight="700" color="$primary">
            {t('diary.entry.open')}
          </SizableText>
        </XStack>
      </XStack>
    </YStack>
  );
}
