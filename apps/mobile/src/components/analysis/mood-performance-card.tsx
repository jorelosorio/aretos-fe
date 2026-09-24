import { SizableText, YStack } from 'tamagui';

import { BasisNote } from '@/components/viz/basis-note';
import { ChartCard } from '@/components/viz/chart-card';
import { formatRate } from '@/components/viz/format';
import { Meter } from '@/components/viz/meter';
import { NotEnoughData } from '@/components/viz/not-enough-data';
import { SPACING, TEXT } from '@/constants/layout';
import type {
  AnalysisThresholds,
  Automaticity,
  MoodPerformance,
} from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

const AUTOMATICITY_COLOR = {
  automatic: '$good',
  mixed: '$cardForeground',
  dependent: '$warning',
} as const satisfies Record<Automaticity, string>;

export function MoodPerformanceCard({
  performance,
  thresholds,
}: {
  performance: MoodPerformance;
  thresholds: AnalysisThresholds;
}) {
  const { t } = useTranslations();
  const empty = t('analysis.empty');

  const automaticity = performance.automaticity;

  return (
    <ChartCard
      title={t('analysis.moodPerformance.title')}
      subtitle={t('analysis.moodPerformance.subtitle')}
      why={t('analysis.moodPerformance.why')}
      footnote={<BasisNote basis={performance.basis} />}
    >
      {automaticity !== null && (
        <YStack gap={SPACING.text}>
          <SizableText
            size={TEXT.heading}
            fontWeight="700"
            color={AUTOMATICITY_COLOR[automaticity]}
          >
            {t(`analysis.moodPerformance.automaticity.${automaticity}`)}
          </SizableText>
          <SizableText size={TEXT.caption} color="$mutedForeground">
            {t(`analysis.moodPerformance.reading.${automaticity}`, {
              low: formatRate(performance.low.rate, empty),
              high: formatRate(performance.high.rate, empty),
            })}
          </SizableText>
        </YStack>
      )}

      <YStack gap={SPACING.items}>
        <Meter
          label={t('analysis.moodPerformance.low')}
          rate={performance.low.rate}
          caption={t('analysis.moodPerformance.days', {
            count: performance.low.n,
          })}
          color="$outcomeMissed"
        />
        <Meter
          label={t('analysis.moodPerformance.neutral')}
          rate={performance.neutral.rate}
          caption={t('analysis.moodPerformance.days', {
            count: performance.neutral.n,
          })}
          muted
        />
        <Meter
          label={t('analysis.moodPerformance.high')}
          rate={performance.high.rate}
          caption={t('analysis.moodPerformance.days', {
            count: performance.high.n,
          })}
          color="$outcomeDone"
        />
      </YStack>

      {automaticity === null && (
        <NotEnoughData
          need={t('analysis.moodPerformance.need', {
            count: thresholds.minPerGroup,
          })}
        />
      )}
    </ChartCard>
  );
}
