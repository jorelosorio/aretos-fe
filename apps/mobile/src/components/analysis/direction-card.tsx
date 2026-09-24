import { SizableText, XStack, YStack } from 'tamagui';

import { ChartCard } from '@/components/viz/chart-card';
import { formatRho } from '@/components/viz/format';
import { NotEnoughData } from '@/components/viz/not-enough-data';
import { SPACING, TEXT } from '@/constants/layout';
import type {
  AnalysisThresholds,
  Correlation,
  MoodDirection,
} from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

function CorrelationRow({
  label,
  correlation,
}: {
  label: string;
  correlation: Correlation | null;
}) {
  const { t } = useTranslations();

  return (
    <XStack items="center" gap={SPACING.items}>
      <SizableText
        flex={1}
        minW={0}
        size={TEXT.caption}
        color="$mutedForeground"
      >
        {label}
      </SizableText>

      {correlation === null ? (
        <SizableText size={TEXT.caption} color="$mutedForeground">
          {t('analysis.empty')}
        </SizableText>
      ) : (
        <YStack items="flex-end">
          <SizableText
            size={TEXT.body}
            fontWeight="700"
            color={
              correlation.significant ? '$cardForeground' : '$mutedForeground'
            }
          >
            {formatRho(correlation.rho)}
          </SizableText>

          <SizableText size={TEXT.caption} color="$mutedForeground">
            {t(`analysis.strength.${correlation.strength}`)} ·{' '}
            {t('analysis.units.pair', { count: correlation.n })}
          </SizableText>
        </YStack>
      )}
    </XStack>
  );
}

export function DirectionCard({
  direction,
  thresholds,
}: {
  direction: MoodDirection;
  thresholds: AnalysisThresholds;
}) {
  const { t } = useTranslations();

  const nothing =
    direction.sameDay === null &&
    direction.moodLeads === null &&
    direction.performanceLeads === null;

  return (
    <ChartCard
      title={t('analysis.direction.title')}
      subtitle={t('analysis.direction.subtitle')}
      footnote={
        nothing ? undefined : (
          <SizableText size={TEXT.caption} color="$mutedForeground">
            {t('analysis.direction.caveat')}
          </SizableText>
        )
      }
    >
      {nothing ? (
        <NotEnoughData
          need={t('analysis.direction.need', {
            count: thresholds.minPairsForCorrelation,
          })}
        />
      ) : (
        <YStack gap={SPACING.items}>
          <CorrelationRow
            label={t('analysis.direction.sameDay')}
            correlation={direction.sameDay}
          />
          <CorrelationRow
            label={t('analysis.direction.moodLeads')}
            correlation={direction.moodLeads}
          />
          <CorrelationRow
            label={t('analysis.direction.performanceLeads')}
            correlation={direction.performanceLeads}
          />
        </YStack>
      )}
    </ChartCard>
  );
}
