import { Check } from '@tamagui/lucide-icons-2/icons/Check';
import { Minus } from '@tamagui/lucide-icons-2/icons/Minus';
import { Circle, SizableText, XStack, YStack } from 'tamagui';

import { Card } from '@/components/common/card';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { TrackingFrequency } from '@/features/goals/types';
import { useTranslations } from '@/lib/i18n';

import { skipAmount } from './skip-limit-copy';

const MARK = 20;
const RUN_BEFORE = 2;
const RUN_AFTER = 1;
const MAX_DRAWN_SKIPS = 8;

function CountedMark() {
  return (
    <Circle size={MARK} bg="$primary" items="center" justify="center">
      <Check size={ICON.inline} color="$primaryForeground" strokeWidth={3} />
    </Circle>
  );
}

function SkippedMark() {
  return (
    <Circle
      size={MARK}
      bg="$outcomeBlank"
      borderWidth={2}
      borderColor="$outcomeSkipped"
      items="center"
      justify="center"
    >
      <Minus size={ICON.inline} color="$outcomeSkipped" strokeWidth={3} />
    </Circle>
  );
}

function Marks({ skips }: { skips: number }) {
  const drawn = Math.min(skips, MAX_DRAWN_SKIPS);
  const shortened = skips > MAX_DRAWN_SKIPS;

  return (
    <XStack
      items="center"
      gap="$1"
      flexWrap="wrap"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: RUN_BEFORE }, (_, index) => (
        <CountedMark key={`before-${index}`} />
      ))}
      {Array.from({ length: drawn }, (_, index) => (
        <SkippedMark key={`skip-${index}`} />
      ))}
      {shortened && (
        <SizableText size={TEXT.caption} color="$mutedForeground">
          {`… ×${skips}`}
        </SizableText>
      )}
      {Array.from({ length: RUN_AFTER }, (_, index) => (
        <CountedMark key={`after-${index}`} />
      ))}
    </XStack>
  );
}

function Scenario({ skips, caption }: { skips: number; caption: string }) {
  return (
    <YStack gap={SPACING.group}>
      <Marks skips={skips} />
      <SizableText size={TEXT.caption} color="$cardForeground">
        {caption}
      </SizableText>
    </YStack>
  );
}

function Legend() {
  const { t } = useTranslations();

  return (
    <XStack gap={SPACING.items} flexWrap="wrap">
      <XStack items="center" gap="$1.5">
        <CountedMark />
        <SizableText size={TEXT.micro} color="$mutedForeground">
          {t('goals.skipLimit.legendCounts')}
        </SizableText>
      </XStack>
      <XStack items="center" gap="$1.5">
        <SkippedMark />
        <SizableText size={TEXT.micro} color="$mutedForeground">
          {t('goals.skipLimit.legendSkipped')}
        </SizableText>
      </XStack>
    </XStack>
  );
}

export function SkipLimitExample({
  limit,
  frequency,
}: {
  limit: number;
  frequency: TrackingFrequency;
}) {
  const { t } = useTranslations();
  const amount = (count: number) => skipAmount(t, frequency, count);
  const beyond = limit + 1;

  return (
    <Card bg="$muted">
      <SizableText
        size={TEXT.caption}
        fontWeight="700"
        color="$mutedForeground"
      >
        {t('goals.skipLimit.exampleTitle')}
      </SizableText>

      {limit > 0 && (
        <Scenario
          skips={limit}
          caption={t('goals.skipLimit.exampleKept', {
            skips: amount(limit),
            streak: amount(RUN_BEFORE + RUN_AFTER),
          })}
        />
      )}

      <Scenario
        skips={beyond}
        caption={t('goals.skipLimit.exampleRestart', {
          skips: amount(beyond),
          streak: amount(RUN_AFTER),
        })}
      />

      <Legend />
    </Card>
  );
}
