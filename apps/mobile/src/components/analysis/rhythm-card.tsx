import { YStack } from 'tamagui';

import { BarChart, type BarDatum } from '@/components/viz/bar-chart';
import { ChartCard } from '@/components/viz/chart-card';
import { formatPoints, formatRate } from '@/components/viz/format';
import { NotEnoughData } from '@/components/viz/not-enough-data';
import { Stat } from '@/components/viz/stat';
import { SPACING } from '@/constants/layout';
import type {
  AnalysisThresholds,
  Regularity,
  WeekdayCell,
  WeekdayExtremes,
} from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const WIDE_SPREAD = 0.2;
const STEADY_SCORE = 0.7;

export function RhythmCard({
  profile,
  extremes,
  regularity,
  thresholds,
}: {
  profile: readonly WeekdayCell[];
  extremes: WeekdayExtremes | null;
  regularity: Regularity | null;
  thresholds: AnalysisThresholds;
}) {
  const { t } = useTranslations();
  const empty = t('analysis.empty');

  const bars: BarDatum[] = profile.map((cell) => ({
    key: String(cell.weekday),
    label: t(`analysis.weekday.${WEEKDAY_KEYS[cell.weekday]}`),
    value: cell.n >= thresholds.minPerGroup ? cell.rate : null,
    color:
      extremes !== null && cell.weekday === extremes.worst.weekday
        ? '$outcomeMissed'
        : undefined,
  }));

  return (
    <ChartCard
      title={t('analysis.rhythm.title')}
      subtitle={t('analysis.rhythm.subtitle')}
    >
      {(width) => (
        <YStack gap={SPACING.section}>
          <BarChart width={width} bars={bars} />

          {extremes !== null ? (
            <Stat
              label={t('analysis.rhythm.spreadLabel')}
              value={t('analysis.rhythm.spreadValue', {
                points: formatPoints(extremes.spread, empty),
              })}
              tone={extremes.spread >= WIDE_SPREAD ? 'watch' : 'neutral'}
              reading={t('analysis.rhythm.spreadReading', {
                best: t(
                  `analysis.weekday.${WEEKDAY_KEYS[extremes.best.weekday]}`,
                ),
                bestRate: formatRate(extremes.best.rate, empty),
                worst: t(
                  `analysis.weekday.${WEEKDAY_KEYS[extremes.worst.weekday]}`,
                ),
                worstRate: formatRate(extremes.worst.rate, empty),
              })}
            />
          ) : (
            <NotEnoughData
              need={t('analysis.rhythm.needExtremes', {
                count: thresholds.minPerGroup,
              })}
            />
          )}

          {regularity !== null ? (
            <Stat
              label={t('analysis.rhythm.regularityLabel')}
              value={formatRate(regularity.score, empty)}
              tone={regularity.score >= STEADY_SCORE ? 'good' : 'neutral'}
              reading={t('analysis.rhythm.regularityReading', {
                deviation: formatPoints(regularity.standardDeviation, empty),
                mean: formatRate(regularity.meanRate, empty),
              })}
            />
          ) : (
            <NotEnoughData
              need={t('analysis.rhythm.needRegularity', {
                count: thresholds.minPerGroup,
              })}
            />
          )}
        </YStack>
      )}
    </ChartCard>
  );
}
