import { YStack } from 'tamagui';

import { BasisNote } from '@/components/viz/basis-note';
import { ChartCard } from '@/components/viz/chart-card';
import { formatPoints } from '@/components/viz/format';
import { Meter } from '@/components/viz/meter';
import { NotEnoughData } from '@/components/viz/not-enough-data';
import { Stat, type StatTone } from '@/components/viz/stat';
import { SPACING } from '@/constants/layout';
import type {
  AnalysisThresholds,
  Automaticity,
  MoodPerformance,
} from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

const AUTOMATICITY_TONE = {
  automatic: 'good',
  mixed: 'neutral',
  dependent: 'watch',
} as const satisfies Record<Automaticity, StatTone>;

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
      footnote={<BasisNote basis={performance.basis} />}
    >
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

      {performance.dependencyGap === null || automaticity === null ? (
        <NotEnoughData
          need={t('analysis.moodPerformance.need', {
            count: thresholds.minPerGroup,
          })}
        />
      ) : (
        <Stat
          label={t('analysis.moodPerformance.gapLabel')}
          value={t('analysis.moodPerformance.gapValue', {
            points: formatPoints(performance.dependencyGap, empty),
          })}
          tone={AUTOMATICITY_TONE[automaticity]}
          reading={t(`analysis.moodPerformance.automaticity.${automaticity}`)}
        />
      )}
    </ChartCard>
  );
}
