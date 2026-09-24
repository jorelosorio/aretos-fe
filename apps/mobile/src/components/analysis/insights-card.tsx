import {
  Award,
  CalendarDays,
  Flame,
  Lightbulb,
  Smile,
  Sprout,
  TrendingUp,
} from '@tamagui/lucide-icons-2';
import { SizableText, XStack, YStack } from 'tamagui';

import { formatRate } from '@/components/viz/format';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { AnalysisReport } from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

import { buildInsights, type InsightKind, type InsightTone } from './insights';

const KIND_ICONS = {
  trend: TrendingUp,
  weekday: CalendarDays,
  mood: Smile,
  formed: Award,
  closest: Sprout,
  streak: Flame,
  plan: Lightbulb,
} as const satisfies Record<InsightKind, typeof Flame>;

const TONE_COLORS = {
  good: '$good',
  watch: '$warning',
  info: '$primary',
} as const satisfies Record<InsightTone, string>;

function Headline({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <YStack flex={1} gap={SPACING.text}>
      <SizableText size={TEXT.caption} color="$mutedForeground">
        {label}
      </SizableText>
      <SizableText size={TEXT.display} fontWeight="700" color="$cardForeground">
        {value}
      </SizableText>
      <SizableText size={TEXT.caption} color="$mutedForeground">
        {caption}
      </SizableText>
    </YStack>
  );
}

export function InsightsCard({ report }: { report: AnalysisReport }) {
  const { t } = useTranslations();
  const empty = t('analysis.empty');

  const insights = buildInsights(report, t);
  const { cadence } = report;

  return (
    <YStack
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
      p={SPACING.card}
      gap={SPACING.section}
    >
      <YStack gap={SPACING.items}>
        <SizableText
          size={TEXT.subheading}
          fontWeight="700"
          color="$cardForeground"
        >
          {t('analysis.insights.title')}
        </SizableText>

        <XStack gap={SPACING.items}>
          <Headline
            label={t('analysis.insights.showUp')}
            value={formatRate(cadence.loggingRate, empty)}
            caption={t('analysis.insights.showUpCaption', {
              logged: cadence.logged,
              periods: cadence.periods,
            })}
          />
          <YStack width={1} bg="$border" />
          <Headline
            label={t('analysis.insights.followThrough')}
            value={formatRate(cadence.completionRate, empty)}
            caption={t('analysis.insights.followThroughCaption')}
          />
        </XStack>
      </YStack>

      <YStack gap={SPACING.items}>
        {insights.length === 0 ? (
          <SizableText size={TEXT.body} color="$mutedForeground">
            {t('analysis.insights.none')}
          </SizableText>
        ) : (
          insights.map((insight) => {
            const Icon = KIND_ICONS[insight.kind];

            return (
              <XStack key={insight.kind} gap={SPACING.items} items="flex-start">
                <YStack
                  width={28}
                  height={28}
                  rounded={14}
                  items="center"
                  justify="center"
                  bg="$muted"
                >
                  <Icon size={ICON.inline} color={TONE_COLORS[insight.tone]} />
                </YStack>

                <SizableText
                  flex={1}
                  size={TEXT.body}
                  color="$cardForeground"
                  pt={2}
                >
                  {insight.text}
                </SizableText>
              </XStack>
            );
          })
        )}
      </YStack>
    </YStack>
  );
}
