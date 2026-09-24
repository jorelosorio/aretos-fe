import { Archive, BookOpen } from '@tamagui/lucide-icons-2';
import { Paragraph, Separator, SizableText, XStack, YStack } from 'tamagui';

import { CompletionStatus } from '@/components/goals/completion-status';
import { GoalDot } from '@/components/goals/goal-dot';
import { MOOD_LABELS } from '@/components/logs/mood-labels';
import { PeriodMood } from '@/components/logs/period-mood';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { DiaryEntry } from '@/features/diary';
import { useTranslations } from '@/lib/i18n';

import { periodLabel } from './diary-date';
import { notePreview } from './note-preview';

const NOTE_LINES = 4;
const MOOD_FACE = 28;

export function DiaryEntryCard({
  entry,
  onPress,
}: {
  entry: DiaryEntry;
  onPress: () => void;
}) {
  const { t, locale } = useTranslations();

  const { goal, note, mood, answered, total, status } = entry;
  const when = periodLabel(entry.entryDate, entry.endDate, locale);
  const preview = notePreview(note);

  const label = [
    mood === null ? null : t(MOOD_LABELS[mood]),
    preview === '' ? null : preview,
    goal.name,
    when,
  ]
    .filter((part) => part !== null)
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
        <Paragraph
          flex={1}
          minW={0}
          size={TEXT.body}
          color="$cardForeground"
          numberOfLines={NOTE_LINES}
          ellipsizeMode="tail"
        >
          {preview}
        </Paragraph>

        <PeriodMood mood={mood} size={MOOD_FACE} active />
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
            <GoalDot slot={goal.colorSlot} size={8} />
            <SizableText
              shrink={1}
              size={TEXT.caption}
              color="$mutedForeground"
              numberOfLines={1}
            >
              {goal.name}
            </SizableText>

            {goal.archived && (
              <Archive size={ICON.inline} color="$mutedForeground" />
            )}

            <SizableText
              size={TEXT.caption}
              color="$mutedForeground"
              numberOfLines={1}
            >
              {`· ${when}`}
            </SizableText>
          </XStack>

          {total > 0 && (
            <CompletionStatus
              status={status}
              answered={answered}
              total={total}
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
