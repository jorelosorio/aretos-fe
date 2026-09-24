import { SizableText, XStack, YStack } from 'tamagui';

import { BarChart, type BarDatum } from '@/components/viz/bar-chart';
import { ChartCard } from '@/components/viz/chart-card';
import { formatRate, outOfTen } from '@/components/viz/format';
import { NotEnoughData } from '@/components/viz/not-enough-data';
import { SPACING, TEXT } from '@/constants/layout';
import type {
  AnalysisThresholds,
  Regularity,
  RegularityBand,
  WeekdayCell,
  WeekdayExtremes,
} from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const BAND_COLORS = {
  steady: '$good',
  variable: '$cardForeground',
  erratic: '$warning',
} as const satisfies Record<RegularityBand, string>;

function DayStat({
  label,
  day,
  rate,
  color,
}: {
  label: string;
  day: string;
  rate: number | null;
  color: '$good' | '$outcomeMissed';
}) {
  const { t } = useTranslations();

  return (
    <YStack
      flex={1}
      gap={SPACING.text}
      p={SPACING.cardTight}
      rounded="$xl"
      bg="$muted"
    >
      <SizableText size={TEXT.caption} color="$mutedForeground">
        {label}
      </SizableText>
      <SizableText size={TEXT.heading} fontWeight="700" color={color}>
        {day}
      </SizableText>
      <SizableText size={TEXT.caption} color="$mutedForeground">
        {`${formatRate(rate, t('analysis.empty'))} · ${t(
          'analysis.rhythm.outOfTen',
          { count: outOfTen(rate ?? 0) },
        )}`}
      </SizableText>
    </YStack>
  );
}

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

  const bars: BarDatum[] = profile.map((cell) => {
    const measured = cell.n >= thresholds.minPerGroup ? cell.rate : null;
    const isWorst =
      extremes !== null && cell.weekday === extremes.worst.weekday;
    const isBest = extremes !== null && cell.weekday === extremes.best.weekday;

    return {
      key: String(cell.weekday),
      label: t(`analysis.weekday.${WEEKDAY_KEYS[cell.weekday]}`),
      value: measured,
      caption: measured === null ? undefined : formatRate(measured, empty),
      color: isWorst ? '$outcomeMissed' : isBest ? '$good' : undefined,
    };
  });

  return (
    <ChartCard
      title={t('analysis.rhythm.title')}
      subtitle={t('analysis.rhythm.subtitle')}
      why={t('analysis.rhythm.why')}
    >
      {(width) => (
        <YStack gap={SPACING.section}>
          <BarChart width={width} bars={bars} />

          {extremes !== null ? (
            <XStack gap={SPACING.items}>
              <DayStat
                label={t('analysis.rhythm.best')}
                day={t(
                  `analysis.weekday.${WEEKDAY_KEYS[extremes.best.weekday]}`,
                )}
                rate={extremes.best.rate}
                color="$good"
              />
              <DayStat
                label={t('analysis.rhythm.worst')}
                day={t(
                  `analysis.weekday.${WEEKDAY_KEYS[extremes.worst.weekday]}`,
                )}
                rate={extremes.worst.rate}
                color="$outcomeMissed"
              />
            </XStack>
          ) : (
            <NotEnoughData
              need={t('analysis.rhythm.needExtremes', {
                count: thresholds.minPerGroup,
              })}
            />
          )}

          {regularity !== null ? (
            <YStack gap={SPACING.text}>
              <SizableText size={TEXT.caption} color="$mutedForeground">
                {t('analysis.rhythm.regularity')}
              </SizableText>
              <SizableText
                size={TEXT.heading}
                fontWeight="700"
                color={BAND_COLORS[regularity.band]}
              >
                {t(`analysis.rhythm.regularityBand.${regularity.band}`)}
              </SizableText>
              <SizableText size={TEXT.caption} color="$mutedForeground">
                {t('analysis.rhythm.regularityReading', {
                  low: formatRate(regularity.typicalLow, empty),
                  high: formatRate(regularity.typicalHigh, empty),
                })}
              </SizableText>
            </YStack>
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
