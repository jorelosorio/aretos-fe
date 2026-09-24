import { SizableText, XStack, YStack } from 'tamagui';

import { ChartCard } from '@/components/viz/chart-card';
import { formatRate } from '@/components/viz/format';
import { Meter } from '@/components/viz/meter';
import { SPACING, TEXT } from '@/constants/layout';
import type { AnalysisHabit, AnalysisThresholds } from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

export function HabitsCard({
  habits,
  thresholds,
}: {
  habits: readonly AnalysisHabit[];
  thresholds: AnalysisThresholds;
}) {
  const { t } = useTranslations();
  const empty = t('analysis.empty');

  if (habits.length === 0) return null;

  return (
    <ChartCard
      title={t('analysis.habits.title')}
      subtitle={t('analysis.habits.subtitle', {
        median: thresholds.lallyMedianDays,
        low: thresholds.lallyRangeDays[0],
        high: thresholds.lallyRangeDays[1],
      })}
    >
      <YStack gap={SPACING.section}>
        {habits.map((habit) => (
          <YStack key={habit.id} gap={SPACING.group}>
            <XStack items="center" gap="$2">
              <SizableText
                flex={1}
                minW={0}
                size={TEXT.body}
                fontWeight="600"
                color="$cardForeground"
              >
                {habit.name}
              </SizableText>

              <SizableText
                size={TEXT.caption}
                fontWeight="700"
                color="$cardForeground"
              >
                {formatRate(habit.mix.rate, empty)}
              </SizableText>
            </XStack>

            <Meter
              label={t('analysis.habits.formation')}
              rate={habit.formation.towardMedian}
              caption={t('analysis.habits.repetitions', {
                count: habit.formation.repetitions,
                median: thresholds.lallyMedianDays,
              })}
            />

            <SizableText size={TEXT.caption} color="$mutedForeground">
              {t('analysis.habits.span', { count: habit.formation.spanDays })}
            </SizableText>
          </YStack>
        ))}
      </YStack>
    </ChartCard>
  );
}
