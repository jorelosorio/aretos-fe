import { useTheme } from '@tamagui/core';
import { SizableText, XStack, YStack } from 'tamagui';

import { SectionTitle } from '@/components/common/section-title';
import { SPACING, TEXT } from '@/constants/layout';
import { MOOD_SCORES, type MoodScore } from '@/features/logs';
import { useTranslations } from '@/lib/i18n';

import { MoodFace } from './mood-face';
import { MOOD_LABELS } from './mood-labels';

const FACE_SIZE = 48;
const TILE_MIN_HEIGHT = 80;

export function MoodPicker({
  value,
  onChange,
}: {
  value: MoodScore | null;
  onChange: (value: MoodScore | null) => void;
}) {
  const { t } = useTranslations();
  const theme = useTheme();

  return (
    <YStack gap={SPACING.items}>
      <SectionTitle>
        {t('logs.mood.question')}{' '}
        <SizableText
          size={TEXT.body}
          fontFamily="$body"
          color="$mutedForeground"
        >
          {t('logs.mood.optional')}
        </SizableText>
      </SectionTitle>

      <XStack
        gap={SPACING.group}
        accessibilityRole="radiogroup"
        accessibilityLabel={t('logs.mood.scaleLabel')}
      >
        {MOOD_SCORES.map((score) => {
          const selected = value === score;

          return (
            <YStack
              key={score}
              flex={1}
              minW={0}
              minH={TILE_MIN_HEIGHT}
              items="center"
              justify="center"
              rounded="$xl"
              bg={selected ? '$primary' : '$secondary'}
              pressStyle={{ opacity: 0.7 }}
              onPress={() => onChange(selected ? null : score)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={t(MOOD_LABELS[score])}
              accessibilityHint={t('logs.mood.clearHint')}
            >
              <MoodFace
                score={score}
                size={FACE_SIZE}
                color={
                  selected
                    ? theme.primaryForeground.val
                    : theme.secondaryForeground.val
                }
              />
            </YStack>
          );
        })}
      </XStack>

      <XStack justify="space-between">
        <SizableText size={TEXT.micro} color="$mutedForeground">
          {t(MOOD_LABELS[MOOD_SCORES[0]])}
        </SizableText>
        <SizableText size={TEXT.micro} color="$mutedForeground">
          {t(MOOD_LABELS[MOOD_SCORES[MOOD_SCORES.length - 1]])}
        </SizableText>
      </XStack>
    </YStack>
  );
}
