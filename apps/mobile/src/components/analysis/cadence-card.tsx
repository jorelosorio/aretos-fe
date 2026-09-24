import { SizableText, XStack, YStack, type ColorTokens } from 'tamagui';

import { BasisNote } from '@/components/viz/basis-note';
import { ChartCard } from '@/components/viz/chart-card';
import { Meter } from '@/components/viz/meter';
import { TEXT, SPACING } from '@/constants/layout';
import type { Cadence } from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

const STATUSES = ['complete', 'partial', 'missed', 'skipped', 'empty'] as const;

type Status = (typeof STATUSES)[number];

const STATUS_COLORS = {
  complete: '$outcomeDone',
  partial: '$primary',
  missed: '$outcomeMissed',
  skipped: '$outcomeSkipped',
  empty: '$outcomeBlank',
} as const satisfies Record<Status, ColorTokens>;

export function CadenceCard({ cadence }: { cadence: Cadence }) {
  const { t } = useTranslations();

  return (
    <ChartCard
      title={t('analysis.cadence.title')}
      subtitle={t('analysis.cadence.subtitle')}
      footnote={<BasisNote basis={cadence.basis} />}
    >
      <YStack gap={SPACING.items}>
        <Meter
          label={t('analysis.cadence.logging')}
          rate={cadence.loggingRate}
          caption={`${cadence.logged}/${cadence.periods}`}
        />
        <Meter
          label={t('analysis.cadence.completion')}
          rate={cadence.completionRate}
        />
        <Meter
          label={t('analysis.cadence.counted')}
          rate={cadence.countedRate}
          caption={`${cadence.counted}/${cadence.periods}`}
        />
      </YStack>

      <XStack flexWrap="wrap" gap="$2">
        {STATUSES.map((status) => (
          <XStack
            key={status}
            items="center"
            gap="$1.5"
            bg="$muted"
            rounded="$xl"
            px="$2.5"
            py="$1.5"
          >
            <YStack
              width={8}
              height={8}
              rounded={4}
              bg={STATUS_COLORS[status]}
            />

            <SizableText size={TEXT.caption} color="$mutedForeground">
              {t(`analysis.cadence.status.${status}`)}
            </SizableText>

            <SizableText
              size={TEXT.caption}
              fontWeight="700"
              color="$cardForeground"
            >
              {cadence[status]}
            </SizableText>
          </XStack>
        ))}
      </XStack>
    </ChartCard>
  );
}
