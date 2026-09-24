import { useState } from 'react';
import { RefreshControl } from 'react-native';
import { useTheme } from '@tamagui/core';
import {
  CalendarDays,
  Info,
  Gauge,
  ListChecks,
  Smile,
  Target,
} from '@tamagui/lucide-icons-2';
import { ScrollView, Separator, SizableText, XStack, YStack } from 'tamagui';

import { shortDateLabel } from '@/components/common/date-label';
import { ErrorNotice } from '@/components/common/error-notice';
import { useTabBarInset } from '@/components/common/floating-tab-bar';
import { ScreenLoader } from '@/components/common/screen-loader';
import {
  SegmentedControl,
  type Segment,
} from '@/components/common/segmented-control';
import { EmptyLog } from '@/components/logs/empty-log';
import { ILLUSTRATIONS } from '@/constants/illustrations';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import {
  useAnalysis,
  useAnalysisErrorMessage,
  type AnalysisReport,
  type AnalysisWindow,
} from '@/features/analysis';
import { useGoals } from '@/features/goals';
import { useTranslations } from '@/lib/i18n';

import { CadenceCard } from './cadence-card';
import { DirectionCard } from './direction-card';
import { GoalsCard } from './goals-card';
import { HabitsCard } from './habits-card';
import { HeatmapCard } from './heatmap-card';
import { InsightsCard } from './insights-card';
import { MixCard } from './mix-card';
import { MoodCard } from './mood-card';
import { MoodPerformanceCard } from './mood-performance-card';
import { RhythmCard } from './rhythm-card';
import { ScopeFilter } from './scope-filter';
import { SetupCard } from './setup-card';
import { TrendCard } from './trend-card';
import { WindowFilter } from './window-filter';

const SECTIONS = ['summary', 'rhythm', 'mood', 'detail'] as const;

type Section = (typeof SECTIONS)[number];

const SECTION_ICONS = {
  summary: Gauge,
  rhythm: CalendarDays,
  mood: Smile,
  detail: ListChecks,
} as const satisfies Record<Section, typeof Target>;

function SectionCards({
  section,
  report,
  pending,
}: {
  section: Section;
  report: AnalysisReport;
  pending: boolean;
}) {
  if (section === 'summary') {
    return (
      <>
        <InsightsCard report={report} />
        <CadenceCard cadence={report.cadence} />
        <MixCard mix={report.mix} />
        <SetupCard setup={report.setup} />
      </>
    );
  }

  if (section === 'rhythm') {
    return (
      <>
        <HeatmapCard
          cells={report.heatmap}
          calendar={report.calendar}
          pending={pending}
        />
        <RhythmCard
          profile={report.profile}
          extremes={report.extremes}
          regularity={report.regularity}
          thresholds={report.thresholds}
        />
        <TrendCard
          trend={report.trend}
          series={report.series}
          thresholds={report.thresholds}
        />
      </>
    );
  }

  if (section === 'mood') {
    return (
      <>
        <MoodCard moods={report.moods} series={report.series} />
        <MoodPerformanceCard
          performance={report.moodPerformance}
          thresholds={report.thresholds}
        />
        <DirectionCard
          direction={report.direction}
          thresholds={report.thresholds}
        />
      </>
    );
  }

  return (
    <>
      <GoalsCard goals={report.goals} pending={pending} />
      <HabitsCard
        habits={report.habits}
        goals={report.goals}
        thresholds={report.thresholds}
      />
    </>
  );
}

export function AnalysisScreen() {
  const { t, locale } = useTranslations();
  const theme = useTheme();
  const tabBarInset = useTabBarInset();
  const toMessage = useAnalysisErrorMessage();

  const [days, setDays] = useState<AnalysisWindow>(90);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [section, setSection] = useState<Section>('summary');

  const { data: goals } = useGoals();

  const {
    data: report,
    isPending,
    isPlaceholderData,
    error,
    refetch,
    isRefetching,
  } = useAnalysis(days, goalId);

  const sections: Segment<Section>[] = SECTIONS.map((value) => ({
    value,
    label: t(`analysis.section.${value}`),
    Icon: SECTION_ICONS[value],
  }));

  return (
    <ScrollView
      flex={1}
      bg="$background"
      contentContainerStyle={{ pb: tabBarInset }}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          tintColor={theme.primary.val}
          colors={[theme.primary.val]}
        />
      }
    >
      <YStack pt={SPACING.screen} pb={SPACING.screen} gap={SPACING.section}>
        <YStack gap={SPACING.items} px={SPACING.screen}>
          <ScopeFilter
            goals={goals ?? []}
            value={goalId}
            onChange={setGoalId}
          />

          <WindowFilter value={days} onChange={setDays} />
        </YStack>

        {error ? (
          <YStack px={SPACING.screen}>
            <ErrorNotice message={toMessage(error)} />
          </YStack>
        ) : isPending ? (
          <ScreenLoader />
        ) : report.setup.goals === 0 ? (
          <EmptyLog
            Icon={Target}
            illustration={ILLUSTRATIONS.noGoals}
            title={t('goals.empty.title')}
            body={t('goals.empty.body')}
          />
        ) : (
          <>
            <YStack px={SPACING.screen} gap={SPACING.group}>
              <Separator borderColor="$border" />

              <SegmentedControl
                segments={sections}
                value={section}
                onChange={setSection}
              />

              <SizableText size={TEXT.caption} color="$mutedForeground">
                {t(`analysis.sectionHint.${section}`)}
              </SizableText>

              {report.trackedFrom > report.from && (
                <XStack
                  items="flex-start"
                  gap="$2"
                  p={SPACING.cardTight}
                  rounded="$xl"
                  bg="$muted"
                >
                  <Info size={ICON.inline} color="$mutedForeground" mt={2} />
                  <SizableText
                    flex={1}
                    size={TEXT.caption}
                    color="$mutedForeground"
                  >
                    {t('analysis.trackedFrom', {
                      date: shortDateLabel(report.trackedFrom, locale),
                    })}
                  </SizableText>
                </XStack>
              )}
            </YStack>

            <YStack px={SPACING.screen} gap={SPACING.items}>
              <SectionCards
                section={section}
                report={report}
                pending={isPlaceholderData}
              />
            </YStack>
          </>
        )}
      </YStack>
    </ScrollView>
  );
}
