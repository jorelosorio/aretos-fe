import { useTheme } from '@tamagui/core';
import { SizableText, XStack, YStack } from 'tamagui';

import { SPACING } from '@/constants/layout';
import { MOOD_SCORES, type MoodScore } from '@/features/logs';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import { MoodFace } from './mood-face';

const FACE_SIZE = 48;
const TILE_MIN_HEIGHT = 72;

const MOOD_LABELS: Record<MoodScore, TranslationKey> = {
  1: 'logs.mood.scale.1',
  2: 'logs.mood.scale.2',
  3: 'logs.mood.scale.3',
  4: 'logs.mood.scale.4',
  5: 'logs.mood.scale.5',
};

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
    <YStack gap={SPACING.group}>
      <SizableText size="$3" fontWeight="600" color="$color">
        {t('logs.mood.question')}{' '}
        <SizableText size="$3" color="$mutedForeground">
          {t('logs.mood.optional')}
        </SizableText>
      </SizableText>

      <XStack
        gap={SPACING.text}
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

      <XStack justify="space-between" px="$1">
        <SizableText size="$1" color="$mutedForeground">
          {t(MOOD_LABELS[MOOD_SCORES[0]])}
        </SizableText>
        <SizableText size="$1" color="$mutedForeground">
          {t(MOOD_LABELS[MOOD_SCORES[MOOD_SCORES.length - 1]])}
        </SizableText>
      </XStack>
    </YStack>
  );
}
