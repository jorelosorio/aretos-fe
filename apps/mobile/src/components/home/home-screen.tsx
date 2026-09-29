import { useCallback, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@tamagui/core';
import { CalendarDays } from '@tamagui/lucide-icons-2/icons/CalendarDays';
import { CircleCheck } from '@tamagui/lucide-icons-2/icons/CircleCheck';
import { Target } from '@tamagui/lucide-icons-2/icons/Target';
import { SizableText, YStack } from 'tamagui';

import { longDateLabel } from '@/components/common/date-label';
import { ErrorNotice } from '@/components/common/error-notice';
import { useTabBarInset } from '@/components/common/floating-tab-bar';
import { ScreenHeader } from '@/components/common/screen-header';
import { ScreenLoader } from '@/components/common/screen-loader';
import {
  SegmentedControl,
  type Segment,
} from '@/components/common/segmented-control';
import { EmptyState } from '@/components/common/empty-state';
import { ILLUSTRATIONS } from '@/components/common/illustrations';
import { SPACING, TEXT } from '@/constants/layout';
import { useGoalErrorMessage, useGoals } from '@/features/goals/hooks';
import type { Goal } from '@/features/goals/types';
import { useAllowance } from '@/features/limits/hooks';
import { useTranslations } from '@/lib/i18n';

import { GoalStatusCard } from './goal-status-card';
import { HomeHeader } from './home-header';

type ScoredGoal = Goal & { progress: NonNullable<Goal['progress']> };

type HomeTab = 'pending' | 'logged';

const isScored = (goal: Goal): goal is ScoredGoal =>
  goal.progress !== undefined;

export function HomeScreen() {
  const { t, locale } = useTranslations();
  const theme = useTheme();
  const toMessage = useGoalErrorMessage();
  const tabBarInset = useTabBarInset();
  const router = useRouter();
  const { canCreate } = useAllowance('goal');
  const [picked, setPicked] = useState<HomeTab | null>(null);

  const goals = useGoals({ include: ['progress'] });

  const scored = (goals.data ?? []).filter(isScored);
  const pending = scored.filter((goal) => !goal.progress.currentPeriod.logged);
  const logged = scored.filter((goal) => goal.progress.currentPeriod.logged);
  const today = scored[0]?.progress.today ?? null;

  const tab: HomeTab =
    picked ??
    (pending.length > 0 || logged.length === 0 ? 'pending' : 'logged');
  const shown = tab === 'pending' ? pending : logged;

  const segments: Segment<HomeTab>[] = [
    { value: 'pending', label: t('home.sections.pending') },
    { value: 'logged', label: t('home.sections.logged') },
  ];

  const open = useCallback(
    (goal: Goal) =>
      goal.habitCount === 0
        ? router.push({
            pathname: '/goals/[id]/habits/new',
            params: { id: goal.id },
          })
        : router.push({
            pathname: '/goals/[id]/check-in',
            params: { id: goal.id },
          }),
    [router],
  );

  let empty = null;
  if (goals.isPending) {
    empty = <ScreenLoader />;
  } else if (scored.length > 0 && tab === 'pending') {
    empty = (
      <EmptyState
        Icon={CircleCheck}
        illustration={ILLUSTRATIONS.allLogged}
        title={t('home.allLogged')}
        body={t('home.allLoggedBody')}
      />
    );
  } else if (scored.length > 0) {
    empty = (
      <EmptyState
        Icon={CalendarDays}
        illustration={ILLUSTRATIONS.nothingLogged}
        title={t('home.noneLogged')}
        body={t('home.noneLoggedBody')}
      />
    );
  } else if (!goals.error) {
    empty = (
      <EmptyState
        Icon={Target}
        illustration={ILLUSTRATIONS.noGoals}
        title={t('goals.empty.title')}
        body={t('goals.empty.body')}
        action={
          canCreate
            ? {
                label: t('guide.start'),
                Icon: Target,
                onPress: () => router.push('/guide'),
              }
            : undefined
        }
      />
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.background.val }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarInset }}
      data={shown}
      extraData={tab}
      keyExtractor={(goal) => goal.id}
      refreshControl={
        <RefreshControl
          refreshing={goals.isRefetching}
          onRefresh={() => void goals.refetch()}
          tintColor={theme.primary.val}
          colors={[theme.primary.val]}
        />
      }
      ListHeaderComponent={
        <YStack gap={SPACING.items} px={SPACING.screen} pb={SPACING.items}>
          <ScreenHeader>
            <HomeHeader />
          </ScreenHeader>

          <ErrorNotice message={toMessage(goals.error)} />

          {scored.length > 0 && (
            <YStack gap={SPACING.items} pt={SPACING.group}>
              <YStack gap={SPACING.text}>
                {today !== null && (
                  <SizableText
                    size={TEXT.title}
                    fontWeight="700"
                    color="$color"
                    accessibilityRole="header"
                  >
                    {longDateLabel(today, locale)}
                  </SizableText>
                )}
                <SizableText size={TEXT.caption} color="$mutedForeground">
                  {t('home.summary', {
                    logged: logged.length,
                    total: scored.length,
                  })}
                </SizableText>
              </YStack>

              <SegmentedControl
                segments={segments}
                value={tab}
                onChange={setPicked}
              />
            </YStack>
          )}
        </YStack>
      }
      ListEmptyComponent={empty}
      renderItem={({ item }) => (
        <YStack px={SPACING.screen} pb={SPACING.items}>
          <GoalStatusCard goal={item} progress={item.progress} onOpen={open} />
        </YStack>
      )}
    />
  );
}
