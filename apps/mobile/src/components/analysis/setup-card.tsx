import { CircleCheck } from '@tamagui/lucide-icons-2';
import { Separator, SizableText, XStack, YStack } from 'tamagui';

import { ChartCard } from '@/components/viz/chart-card';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { Coverage, Setup } from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

const TRACK_HEIGHT = 6;

function CoverageRow({
  label,
  hint,
  coverage,
}: {
  label: string;
  hint: string;
  coverage: Coverage;
}) {
  const { t } = useTranslations();

  const done = coverage.rate !== null && coverage.rate >= 1;
  const percent = coverage.rate === null ? 0 : coverage.rate * 100;

  return (
    <YStack gap={SPACING.group}>
      <XStack items="center" gap={SPACING.items}>
        <SizableText
          flex={1}
          size={TEXT.body}
          fontWeight="600"
          color="$cardForeground"
        >
          {label}
        </SizableText>

        {coverage.rate === null ? (
          <SizableText size={TEXT.caption} color="$mutedForeground">
            {t('analysis.setup.na')}
          </SizableText>
        ) : done ? (
          <XStack items="center" gap="$1">
            <CircleCheck size={ICON.inline} color="$good" />
            <SizableText size={TEXT.caption} fontWeight="700" color="$good">
              {t('analysis.setup.complete')}
            </SizableText>
          </XStack>
        ) : (
          <SizableText
            size={TEXT.caption}
            fontWeight="700"
            color="$cardForeground"
          >
            {`${coverage.count}/${coverage.of}`}
          </SizableText>
        )}
      </XStack>

      {coverage.rate !== null && !done && (
        <YStack
          height={TRACK_HEIGHT}
          rounded={TRACK_HEIGHT / 2}
          bg="$vizTrack"
          overflow="hidden"
        >
          <YStack
            height={TRACK_HEIGHT}
            width={`${percent}%`}
            rounded={TRACK_HEIGHT / 2}
            bg="$primary"
          />
        </YStack>
      )}

      <SizableText size={TEXT.caption} color="$mutedForeground">
        {hint}
      </SizableText>
    </YStack>
  );
}

export function SetupCard({ setup }: { setup: Setup }) {
  const { t } = useTranslations();

  return (
    <ChartCard
      title={t('analysis.setup.title')}
      subtitle={t('analysis.setup.subtitle')}
      why={t('analysis.setup.why')}
      footnote={
        <YStack gap={SPACING.text}>
          <SizableText size={TEXT.caption} color="$mutedForeground">
            {t('analysis.setup.counts', {
              goals: setup.goals,
              habits: setup.habits,
            })}
          </SizableText>
          <SizableText size={TEXT.caption} color="$mutedForeground">
            {t('analysis.setup.modes', {
              binary: setup.modes.binary ?? 0,
              count: setup.modes.count ?? 0,
              duration: setup.modes.duration ?? 0,
              rating: setup.modes.rating ?? 0,
            })}
          </SizableText>
        </YStack>
      }
    >
      <YStack gap={SPACING.items}>
        <CoverageRow
          label={t('analysis.setup.planned')}
          hint={t('analysis.setup.plannedHint')}
          coverage={setup.planned}
        />
        <Separator borderColor="$border" />
        <CoverageRow
          label={t('analysis.setup.thresholded')}
          hint={t('analysis.setup.thresholdedHint')}
          coverage={setup.thresholded}
        />
        <Separator borderColor="$border" />
        <CoverageRow
          label={t('analysis.setup.weighted')}
          hint={t('analysis.setup.weightedHint')}
          coverage={setup.weighted}
        />
      </YStack>
    </ChartCard>
  );
}
