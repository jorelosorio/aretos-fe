import { Separator, SizableText, XStack, YStack } from 'tamagui';

import { ChartCard } from '@/components/viz/chart-card';
import { NotEnoughData } from '@/components/viz/not-enough-data';
import { SPACING, TEXT } from '@/constants/layout';
import type {
  AnalysisThresholds,
  Correlation,
  MoodDirection,
} from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

function reading(correlation: Correlation) {
  if (!correlation.significant || correlation.strength === 'negligible') {
    return 'unclear' as const;
  }
  return correlation.rho > 0 ? ('together' as const) : ('opposite' as const);
}

function CorrelationRow({
  label,
  correlation,
}: {
  label: string;
  correlation: Correlation | null;
}) {
  const { t } = useTranslations();

  const verdict = correlation === null ? null : reading(correlation);
  const clear = verdict !== null && verdict !== 'unclear';

  return (
    <YStack gap={SPACING.text}>
      <XStack items="center" gap={SPACING.items}>
        <SizableText
          flex={1}
          minW={0}
          size={TEXT.caption}
          color="$mutedForeground"
        >
          {label}
        </SizableText>

        {correlation !== null && clear && (
          <XStack px="$2" py="$1" rounded="$lg" bg="$accentSurface">
            <SizableText
              size={TEXT.micro}
              fontWeight="700"
              color="$accentSurfaceForeground"
            >
              {t(`analysis.strength.${correlation.strength}`)}
            </SizableText>
          </XStack>
        )}
      </XStack>

      <SizableText
        size={TEXT.body}
        fontWeight={clear ? '600' : '400'}
        color={clear ? '$cardForeground' : '$mutedForeground'}
      >
        {verdict === null
          ? t('analysis.empty')
          : t(`analysis.direction.${verdict}`)}
      </SizableText>
    </YStack>
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
      why={t('analysis.direction.why')}
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
          <Separator borderColor="$border" />
          <CorrelationRow
            label={t('analysis.direction.moodLeads')}
            correlation={direction.moodLeads}
          />
          <Separator borderColor="$border" />
          <CorrelationRow
            label={t('analysis.direction.performanceLeads')}
            correlation={direction.performanceLeads}
          />
        </YStack>
      )}
    </ChartCard>
  );
}
