import { ArrowRight, TrendingDown, TrendingUp } from '@tamagui/lucide-icons-2';
import { SizableText, XStack, YStack } from 'tamagui';

import { shortDateLabel } from '@/components/common/date-label';
import { ChartCard } from '@/components/viz/chart-card';
import { formatRate } from '@/components/viz/format';
import { LineChart } from '@/components/viz/line-chart';
import { Meter } from '@/components/viz/meter';
import { NotEnoughData } from '@/components/viz/not-enough-data';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type {
  AnalysisThresholds,
  Series,
  Trend,
  TrendDirection,
  TrendHalf,
} from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

import { seriesPoints } from './series-points';

const DIRECTION_COLOR = {
  improving: '$good',
  steady: '$cardForeground',
  declining: '$warning',
} as const satisfies Record<TrendDirection, string>;

const DIRECTION_ICON = {
  improving: TrendingUp,
  steady: ArrowRight,
  declining: TrendingDown,
} as const satisfies Record<TrendDirection, typeof ArrowRight>;

export function TrendCard({
  trend,
  series,
  thresholds,
}: {
  trend: Trend | null;
  series: Series;
  thresholds: AnalysisThresholds;
}) {
  const { t, locale } = useTranslations();
  const empty = t('analysis.empty');

  const need = t('analysis.trend.need', { count: thresholds.minPerGroup });

  const range = (half: TrendHalf) =>
    `${shortDateLabel(half.from, locale)} – ${shortDateLabel(half.to, locale)}`;

  const card = {
    title: t('analysis.trend.title'),
    subtitle: t('analysis.trend.subtitle'),
    why: t('analysis.trend.why'),
  };

  if (trend === null) {
    return (
      <ChartCard {...card}>
        <NotEnoughData need={need} />
      </ChartCard>
    );
  }

  const direction = trend.direction;
  const points = seriesPoints(series, (point) => point.rate, locale);

  const Icon = direction === null ? null : DIRECTION_ICON[direction];

  return (
    <ChartCard {...card}>
      {(width) => (
        <YStack gap={SPACING.section}>
          {direction !== null && Icon !== null && (
            <YStack gap={SPACING.text}>
              <XStack items="center" gap="$2">
                <SizableText
                  size={TEXT.display}
                  fontWeight="700"
                  color="$mutedForeground"
                >
                  {formatRate(trend.first.rate, empty)}
                </SizableText>
                <ArrowRight size={ICON.feature} color="$mutedForeground" />
                <SizableText
                  size={TEXT.display}
                  fontWeight="700"
                  color={DIRECTION_COLOR[direction]}
                >
                  {formatRate(trend.second.rate, empty)}
                </SizableText>
              </XStack>

              <XStack items="center" gap="$1.5">
                <Icon size={ICON.row} color={DIRECTION_COLOR[direction]} />
                <SizableText
                  size={TEXT.body}
                  fontWeight="600"
                  color={DIRECTION_COLOR[direction]}
                >
                  {t(`analysis.trend.direction.${direction}`)}
                </SizableText>
              </XStack>
            </YStack>
          )}

          {points.length > 1 && (
            <YStack gap={SPACING.group}>
              <SizableText size={TEXT.caption} color="$mutedForeground">
                {t('analysis.overTime')}
              </SizableText>
              <LineChart
                width={width}
                points={points}
                min={0}
                max={1}
                yLabels={['0%', '50%', '100%']}
                area
              />
            </YStack>
          )}

          <YStack gap={SPACING.items}>
            <Meter
              label={t('analysis.trend.first')}
              rate={trend.first.rate}
              caption={range(trend.first)}
              muted
            />
            <Meter
              label={t('analysis.trend.second')}
              rate={trend.second.rate}
              caption={range(trend.second)}
            />
          </YStack>

          {direction === null && <NotEnoughData need={need} />}
        </YStack>
      )}
    </ChartCard>
  );
}
