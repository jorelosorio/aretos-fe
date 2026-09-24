import {
  ArrowRight,
  Flame,
  TrendingDown,
  TrendingUp,
} from '@tamagui/lucide-icons-2';
import { Separator, SizableText, XStack, YStack } from 'tamagui';

import { shortDateLabel } from '@/components/common/date-label';
import { GoalDot } from '@/components/goals/goal-dot';
import { ChartCard } from '@/components/viz/chart-card';
import { formatRate } from '@/components/viz/format';
import { Heatmap } from '@/components/viz/heatmap';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { AnalysisGoal, TrendDirection } from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

const TREND_ICON = {
  improving: TrendingUp,
  steady: ArrowRight,
  declining: TrendingDown,
} as const satisfies Record<TrendDirection, typeof ArrowRight>;

const TREND_COLOR = {
  improving: '$good',
  steady: '$mutedForeground',
  declining: '$warning',
} as const satisfies Record<TrendDirection, string>;

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <YStack flex={1} gap={SPACING.text}>
      <SizableText size={TEXT.caption} color="$mutedForeground">
        {label}
      </SizableText>
      <SizableText size={TEXT.body} fontWeight="700" color="$cardForeground">
        {value}
      </SizableText>
    </YStack>
  );
}

function GoalRow({
  goal,
  width,
  pending,
}: {
  goal: AnalysisGoal;
  width: number;
  pending: boolean;
}) {
  const { t, locale } = useTranslations();
  const empty = t('analysis.empty');

  const direction = goal.trend?.direction ?? null;
  const TrendIcon = direction === null ? null : TREND_ICON[direction];

  const footer = [
    goal.lastEntryDate === null
      ? t('analysis.goals.never')
      : t('analysis.goals.lastEntry', {
          date: shortDateLabel(goal.lastEntryDate, locale),
        }),
    ...(goal.notedPeriods > 0
      ? [t('analysis.goals.notes', { count: goal.notedPeriods })]
      : []),
  ].join(' · ');

  return (
    <YStack gap={SPACING.items}>
      <XStack items="center" gap="$2">
        <GoalDot slot={goal.colorSlot} />

        <SizableText
          flex={1}
          minW={0}
          size={TEXT.subheading}
          fontFamily="$heading"
          color="$cardForeground"
          numberOfLines={1}
        >
          {goal.name}
        </SizableText>

        {direction !== null && TrendIcon !== null && (
          <XStack items="center" gap="$1">
            <TrendIcon size={ICON.inline} color={TREND_COLOR[direction]} />
            <SizableText
              size={TEXT.caption}
              fontWeight="600"
              color={TREND_COLOR[direction]}
            >
              {t(`analysis.goals.trend.${direction}`)}
            </SizableText>
          </XStack>
        )}
      </XStack>

      <XStack gap={SPACING.items}>
        <MiniStat
          label={t('analysis.goals.logging')}
          value={formatRate(goal.cadence.loggingRate, empty)}
        />
        <MiniStat
          label={t('analysis.goals.completion')}
          value={formatRate(goal.cadence.completionRate, empty)}
        />
        <YStack flex={1} gap={SPACING.text}>
          <SizableText size={TEXT.caption} color="$mutedForeground">
            {t('analysis.goals.streak')}
          </SizableText>
          <XStack items="center" gap="$1">
            <Flame
              size={ICON.inline}
              color={goal.currentStreak > 0 ? '$primary' : '$mutedForeground'}
            />
            <SizableText
              size={TEXT.body}
              fontWeight="700"
              color="$cardForeground"
            >
              {goal.currentStreak}
            </SizableText>
            <SizableText size={TEXT.caption} color="$mutedForeground">
              {t('analysis.goals.best', { count: goal.longestStreak })}
            </SizableText>
          </XStack>
        </YStack>
      </XStack>

      <Heatmap width={width} cells={goal.heatmap} compact pending={pending} />

      <SizableText size={TEXT.caption} color="$mutedForeground">
        {footer}
      </SizableText>
    </YStack>
  );
}

export function GoalsCard({
  goals,
  pending = false,
}: {
  goals: readonly AnalysisGoal[];
  pending?: boolean;
}) {
  const { t } = useTranslations();

  if (goals.length === 0) return null;

  return (
    <ChartCard
      title={t('analysis.goals.title')}
      subtitle={t('analysis.goals.subtitle')}
      why={t('analysis.goals.why')}
    >
      {(width) => (
        <YStack gap={SPACING.section}>
          {goals.map((goal, index) => (
            <YStack key={goal.id} gap={SPACING.section}>
              {index > 0 && <Separator borderColor="$border" />}
              <GoalRow goal={goal} width={width} pending={pending} />
            </YStack>
          ))}
        </YStack>
      )}
    </ChartCard>
  );
}
