import { YStack } from 'tamagui';

import { ChartCard } from '@/components/viz/chart-card';
import { formatDelta } from '@/components/viz/format';
import { Meter } from '@/components/viz/meter';
import { NotEnoughData } from '@/components/viz/not-enough-data';
import { Stat, type StatTone } from '@/components/viz/stat';
import { SPACING } from '@/constants/layout';
import type {
  AnalysisThresholds,
  Trend,
  TrendDirection,
} from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

const DIRECTION_TONE = {
  improving: 'good',
  steady: 'neutral',
  declining: 'watch',
} as const satisfies Record<TrendDirection, StatTone>;

export function TrendCard({
  trend,
  thresholds,
}: {
  trend: Trend | null;
  thresholds: AnalysisThresholds;
}) {
  const { t } = useTranslations();
  const empty = t('analysis.empty');

  const need = t('analysis.trend.need', { count: thresholds.minPerGroup });

  if (trend === null) {
    return (
      <ChartCard
        title={t('analysis.trend.title')}
        subtitle={t('analysis.trend.subtitle')}
      >
        <NotEnoughData need={need} />
      </ChartCard>
    );
  }

  const direction = trend.direction;

  return (
    <ChartCard
      title={t('analysis.trend.title')}
      subtitle={t('analysis.trend.subtitle')}
    >
      <YStack gap={SPACING.items}>
        <Meter
          label={t('analysis.trend.first')}
          rate={trend.first.rate}
          caption={t('analysis.trend.half', { count: trend.first.n })}
          muted
        />
        <Meter
          label={t('analysis.trend.second')}
          rate={trend.second.rate}
          caption={t('analysis.trend.half', { count: trend.second.n })}
        />
      </YStack>

      {direction === null ? (
        <NotEnoughData need={need} />
      ) : (
        <Stat
          label={t('analysis.trend.deltaLabel')}
          value={t('analysis.trend.deltaValue', {
            points: formatDelta(trend.delta, empty),
          })}
          tone={DIRECTION_TONE[direction]}
          reading={t(`analysis.trend.direction.${direction}`)}
        />
      )}
    </ChartCard>
  );
}
