import { useTheme } from '@tamagui/core';
import { Archive } from '@tamagui/lucide-icons-2';
import {
  Circle,
  Paragraph,
  Separator,
  SizableText,
  XStack,
  YStack,
} from 'tamagui';

import { slotColor } from '@/components/goals/slot-color';
import { UNIT_LABELS } from '@/components/habits/unit-labels';
import { MoodFace } from '@/components/logs/mood-face';
import { MOOD_LABELS } from '@/components/logs/mood-labels';
import { ICON, SPACING } from '@/constants/layout';
import type { DiaryEntry, DiaryHabitAnswer } from '@/features/diary';
import { useTranslations, type TranslateFn } from '@/lib/i18n';

import { periodLabel } from './diary-date';
import { MARK_COLORS, MARK_LABELS, markOf } from './habit-answer';

const MOOD_BADGE = 36;
const MOOD_FACE = 24;
const NOTE_LINES = 4;
const MAX_ANSWERS = 4;

function answerValue(answer: DiaryHabitAnswer, t: TranslateFn): string | null {
  if (answer.amount === null) return null;

  const unit = UNIT_LABELS[answer.trackingMode];
  return unit === null ? `${answer.amount}` : `${answer.amount} ${t(unit)}`;
}

function AnswerChip({ answer }: { answer: DiaryHabitAnswer }) {
  const { t } = useTranslations();

  const mark = markOf(answer);
  const value = answerValue(answer, t);

  return (
    <XStack
      items="center"
      gap="$1.5"
      px="$2"
      py="$1"
      rounded="$lg"
      bg="$muted"
      opacity={mark === 'pending' ? 0.6 : 1}
      accessibilityLabel={`${answer.name}. ${t(MARK_LABELS[mark])}${
        value === null ? '' : `. ${value}`
      }`}
    >
      <Circle size={6} bg={MARK_COLORS[mark]} />

      <SizableText size="$1" color="$mutedForeground" numberOfLines={1}>
        {answer.name}
      </SizableText>

      {value !== null && (
        <SizableText size="$1" color="$cardForeground" fontWeight="600">
          {value}
        </SizableText>
      )}
    </XStack>
  );
}

export function DiaryEntryCard({
  entry,
  onPress,
}: {
  entry: DiaryEntry;
  onPress: () => void;
}) {
  const { t, locale } = useTranslations();
  const theme = useTheme();

  const { goal, mood, habits } = entry;
  const when = periodLabel(entry.entryDate, goal.trackingFrequency, locale);

  const shown = habits.slice(0, MAX_ANSWERS);
  const hidden = habits.length - shown.length;

  const label = [goal.name, when, mood === null ? null : t(MOOD_LABELS[mood])]
    .filter((part) => part !== null)
    .join('. ');

  return (
    <YStack
      onPress={onPress}
      pressStyle={{ bg: '$muted' }}
      gap={SPACING.items}
      p={SPACING.card}
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <XStack items="center" gap={SPACING.group}>
        <Circle size={10} bg={slotColor(goal.colorSlot)} />

        <YStack flex={1} minW={0} gap={SPACING.text}>
          <XStack items="center" gap="$1.5">
            <SizableText
              shrink={1}
              size="$4"
              fontFamily="$heading"
              color="$cardForeground"
              numberOfLines={1}
            >
              {goal.name}
            </SizableText>

            {goal.archived && (
              <Archive size={ICON.inline} color="$mutedForeground" />
            )}
          </XStack>

          <SizableText size="$2" color="$mutedForeground">
            {when}
          </SizableText>
        </YStack>

        {mood !== null && (
          <Circle size={MOOD_BADGE} bg="$secondary">
            <MoodFace
              score={mood}
              size={MOOD_FACE}
              color={theme.secondaryForeground.val}
              headOnly
            />
          </Circle>
        )}
      </XStack>

      {entry.note !== '' && (
        <Paragraph size="$3" color="$color" numberOfLines={NOTE_LINES}>
          {entry.note}
        </Paragraph>
      )}

      {habits.length > 0 && (
        <>
          <Separator borderColor="$border" />

          <XStack flexWrap="wrap" gap="$1.5">
            {shown.map((answer) => (
              <AnswerChip key={answer.habitId} answer={answer} />
            ))}

            {hidden > 0 && (
              <XStack items="center" px="$2" py="$1">
                <SizableText size="$1" color="$mutedForeground">
                  {t('diary.entry.more', { count: hidden })}
                </SizableText>
              </XStack>
            )}
          </XStack>
        </>
      )}
    </YStack>
  );
}
