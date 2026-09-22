import { Archive } from '@tamagui/lucide-icons-2';
import { Paragraph, SizableText, XStack, YStack } from 'tamagui';

import { CompletionStatus } from '@/components/goals/completion-status';
import { ICON, SPACING } from '@/constants/layout';
import type { DiaryEntry } from '@/features/diary';
import { useTranslations } from '@/lib/i18n';

import { periodLabel } from './diary-date';
import { notePreview } from './note-preview';

const NOTE_LINES = 4;

export function DiaryEntryCard({
  entry,
  onPress,
}: {
  entry: DiaryEntry;
  onPress: () => void;
}) {
  const { locale } = useTranslations();

  const { goal, note, answered, total, status } = entry;
  const when = periodLabel(entry.entryDate, goal.trackingFrequency, locale);
  const preview = notePreview(note);

  const label = [preview === '' ? null : preview, goal.name, when]
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
          size="$5"
          color="$cardForeground"
          numberOfLines={NOTE_LINES}
          ellipsizeMode="tail"
        >
          {preview}
        </Paragraph>
      )}

      <YStack gap={SPACING.text}>
        <XStack items="center" gap="$1.5">
          <SizableText
            shrink={1}
            size="$2"
            color="$mutedForeground"
            numberOfLines={1}
          >
            {goal.name}
          </SizableText>

          {goal.archived && (
            <Archive size={ICON.inline} color="$mutedForeground" />
          )}

          <SizableText size="$2" color="$mutedForeground" numberOfLines={1}>
            {`· ${when}`}
          </SizableText>
        </XStack>

        {total > 0 && (
          <CompletionStatus status={status} answered={answered} total={total} />
        )}
      </YStack>
    </YStack>
  );
}
