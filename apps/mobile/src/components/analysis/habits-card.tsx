import { Separator, SizableText, XStack, YStack } from 'tamagui';

import { slotColor } from '@/components/goals/slot-color';
import { UNIT_LABELS } from '@/components/habits/unit-labels';
import { ChartCard } from '@/components/viz/chart-card';
import { formatRate } from '@/components/viz/format';
import { SPACING, TEXT } from '@/constants/layout';
import type {
  AnalysisGoal,
  AnalysisHabit,
  AnalysisThresholds,
} from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

const TRACK_HEIGHT = 8;

type Stage = 'start' | 'forming' | 'close' | 'formed';

function stageOf(towardMedian: number): Stage {
  if (towardMedian >= 1) return 'formed';
  if (towardMedian >= 0.75) return 'close';
  if (towardMedian >= 0.25) return 'forming';
  return 'start';
}

const STAGE_COLORS = {
  start: '$seq2',
  forming: '$seq3',
  close: '$seq4',
  formed: '$good',
} as const satisfies Record<Stage, string>;

function Badge({ children }: { children: string }) {
  return (
    <XStack px="$2" py="$1" rounded="$lg" bg="$muted">
      <SizableText size={TEXT.micro} color="$mutedForeground">
        {children}
      </SizableText>
    </XStack>
  );
}

function HabitRow({ habit, median }: { habit: AnalysisHabit; median: number }) {
  const { t } = useTranslations();
  const empty = t('analysis.empty');

  const { formation } = habit;
  const stage = stageOf(formation.towardMedian);
  const unit = UNIT_LABELS[habit.trackingMode];

  const badges = [
    ...(habit.hasIfThenPlan ? [t('analysis.habits.plan')] : []),
    ...(habit.successThreshold !== null && unit !== null
      ? [
          t('habits.targetBadge', {
            target: habit.successThreshold,
            unit: t(unit),
          }),
        ]
      : []),
    ...(habit.weight > 1
      ? [t('analysis.habits.weight', { weight: habit.weight })]
      : []),
  ];

  const reading = [
    habit.mix.rate === null
      ? t('analysis.habits.noRate')
      : t('analysis.habits.rate', { rate: formatRate(habit.mix.rate, empty) }),
    ...(formation.spanDays > 0
      ? [t('analysis.habits.span', { count: formation.spanDays })]
      : []),
  ].join(' · ');

  return (
    <YStack gap={SPACING.group}>
      <XStack items="center" gap="$2">
        <SizableText
          flex={1}
          minW={0}
          size={TEXT.body}
          fontWeight="600"
          color="$cardForeground"
        >
          {habit.name}
        </SizableText>
        <SizableText
          size={TEXT.caption}
          fontWeight="700"
          color={stage === 'formed' ? '$good' : '$primary'}
        >
          {t(`analysis.habits.stage.${stage}`)}
        </SizableText>
      </XStack>

      <XStack items="center" gap={SPACING.items}>
        <YStack
          flex={1}
          height={TRACK_HEIGHT}
          rounded={TRACK_HEIGHT / 2}
          bg="$vizTrack"
          overflow="hidden"
        >
          {formation.towardMedian > 0 && (
            <YStack
              height={TRACK_HEIGHT}
              width={`${Math.min(1, formation.towardMedian) * 100}%`}
              rounded={TRACK_HEIGHT / 2}
              bg={STAGE_COLORS[stage]}
            />
          )}
        </YStack>
        <SizableText
          size={TEXT.caption}
          fontWeight="700"
          color="$cardForeground"
        >
          {t('analysis.habits.repetitions', {
            count: formation.repetitions,
            median,
          })}
        </SizableText>
      </XStack>

      <SizableText size={TEXT.caption} color="$mutedForeground">
        {reading}
      </SizableText>

      {badges.length > 0 && (
        <XStack gap="$1.5" flexWrap="wrap">
          {badges.map((badge) => (
            <Badge key={badge}>{badge}</Badge>
          ))}
        </XStack>
      )}
    </YStack>
  );
}

export function HabitsCard({
  habits,
  goals,
  thresholds,
}: {
  habits: readonly AnalysisHabit[];
  goals: readonly AnalysisGoal[];
  thresholds: AnalysisThresholds;
}) {
  const { t } = useTranslations();

  if (habits.length === 0) return null;

  const median = thresholds.lallyMedianDays;

  const groups = goals
    .map((goal) => ({
      goal,
      habits: habits.filter((habit) => habit.goalId === goal.id),
    }))
    .filter((group) => group.habits.length > 0);

  return (
    <ChartCard
      title={t('analysis.habits.title')}
      subtitle={t('analysis.habits.subtitle')}
      why={t('analysis.habits.why', {
        median,
        low: thresholds.lallyRangeDays[0],
        high: thresholds.lallyRangeDays[1],
      })}
    >
      <YStack gap={SPACING.section}>
        {groups.map(({ goal, habits: grouped }, index) => (
          <YStack key={goal.id} gap={SPACING.items}>
            {index > 0 && <Separator borderColor="$border" />}

            {groups.length > 1 && (
              <XStack items="center" gap="$2">
                <YStack
                  width={8}
                  height={8}
                  rounded={4}
                  bg={slotColor(goal.colorSlot)}
                />
                <SizableText
                  size={TEXT.caption}
                  fontWeight="700"
                  color="$mutedForeground"
                >
                  {goal.name}
                </SizableText>
              </XStack>
            )}

            <YStack gap={SPACING.section}>
              {grouped.map((habit) => (
                <HabitRow key={habit.id} habit={habit} median={median} />
              ))}
            </YStack>
          </YStack>
        ))}
      </YStack>
    </ChartCard>
  );
}
