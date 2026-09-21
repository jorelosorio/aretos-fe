import { Archive } from '@tamagui/lucide-icons-2';
import { Paragraph, SizableText, XStack, YStack } from 'tamagui';

import { MOOD_LABELS } from '@/components/logs/mood-labels';
import { ICON, SPACING } from '@/constants/layout';
import type { DiaryEntry } from '@/features/diary';
import { useTranslations } from '@/lib/i18n';

import { periodLabel } from './diary-date';

const NOTE_LINES = 4;

export function DiaryEntryCard({
  entry,
  onPress,
}: {
  entry: DiaryEntry;
  onPress: () => void;
}) {
  const { t, locale } = useTranslations();

  const { goal, mood } = entry;
  const when = periodLabel(entry.entryDate, goal.trackingFrequency, locale);

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

      {entry.note !== '' && (
        <Paragraph size="$3" color="$color" numberOfLines={NOTE_LINES}>
          {entry.note}
        </Paragraph>
      )}
    </YStack>
  );
}
