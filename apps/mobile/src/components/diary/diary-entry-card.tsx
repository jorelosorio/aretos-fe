import { useTheme } from '@tamagui/core';
import { Archive } from '@tamagui/lucide-icons-2';
import { Circle, Paragraph, SizableText, XStack, YStack } from 'tamagui';

import { CompletionStatus } from '@/components/goals/completion-status';
import { MoodFace } from '@/components/logs/mood-face';
import { MOOD_LABELS } from '@/components/logs/mood-labels';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { DiaryEntry } from '@/features/diary';
import { useTranslations } from '@/lib/i18n';

import { periodLabel } from './diary-date';
import { notePreview } from './note-preview';

const NOTE_LINES = 4;
const MOOD_BADGE = 40;
const MOOD_FACE = 26;

export function DiaryEntryCard({
  entry,
  onPress,
}: {
  entry: DiaryEntry;
  onPress: () => void;
}) {
  const { t, locale } = useTranslations();
  const theme = useTheme();

  const { goal, note, mood, answered, total, status } = entry;
  const when = periodLabel(entry.entryDate, entry.endDate, locale);
  const preview = notePreview(note);

  const label = [
    preview === '' ? null : preview,
    goal.name,
    when,
    mood === null ? null : t(MOOD_LABELS[mood]),
  ]
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
      {preview !== '' && (
        <Paragraph
          size={TEXT.body}
          color="$cardForeground"
          numberOfLines={NOTE_LINES}
          ellipsizeMode="tail"
        >
          {preview}
        </Paragraph>
      )}

      <XStack items="flex-end" justify="space-between" gap={SPACING.items}>
        <YStack flex={1} minW={0} gap={SPACING.text}>
          <XStack items="center" gap="$1.5">
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

        {mood !== null && (
          <Circle size={MOOD_BADGE} items="center" justify="center" bg="$muted">
            <MoodFace
              score={mood}
              size={MOOD_FACE}
              color={theme.mutedForeground.val}
            />
          </Circle>
        )}
      </XStack>
    </YStack>
  );
}
