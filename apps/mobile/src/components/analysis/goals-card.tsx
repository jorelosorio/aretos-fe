import { Flame } from '@tamagui/lucide-icons-2';
import { SizableText, XStack, YStack } from 'tamagui';

import { slotColor } from '@/components/goals/slot-color';
import { ChartCard } from '@/components/viz/chart-card';
import { formatRate } from '@/components/viz/format';
import { Heatmap } from '@/components/viz/heatmap';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { AnalysisGoal } from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

export function GoalsCard({ goals }: { goals: readonly AnalysisGoal[] }) {
  const { t } = useTranslations();
  const empty = t('analysis.empty');

  if (goals.length === 0) return null;

  return (
    <ChartCard
      title={t('analysis.goals.title')}
      subtitle={t('analysis.goals.subtitle')}
    >
      {(width) => (
        <YStack gap={SPACING.section}>
          {goals.map((goal) => (
            <YStack key={goal.id} gap={SPACING.group}>
              <XStack items="center" gap="$2">
                <YStack
                  width={10}
                  height={10}
                  rounded={5}
                  bg={slotColor(goal.colorSlot)}
                />

                <SizableText
                  flex={1}
                  minW={0}
                  size={TEXT.body}
                  fontWeight="600"
                  color="$cardForeground"
                >
                  {goal.name}
                </SizableText>

                <SizableText
                  size={TEXT.caption}
                  fontWeight="700"
                  color="$cardForeground"
                >
                  {formatRate(goal.cadence.completionRate, empty)}
                </SizableText>
              </XStack>

              <XStack items="center" gap="$1.5">
                <Flame size={ICON.inline} color="$primary" />

                <SizableText size={TEXT.caption} color="$mutedForeground">
                  {t('analysis.goals.streaks', {
                    current: goal.currentStreak,
                    longest: goal.longestStreak,
                  })}
                </SizableText>
              </XStack>

              <Heatmap width={width} cells={goal.heatmap} compact />
            </YStack>
          ))}
        </YStack>
      )}
    </ChartCard>
  );
}
