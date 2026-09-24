import { FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@tamagui/core';
import { Target } from '@tamagui/lucide-icons-2';
import { YStack } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { useTabBarInset } from '@/components/common/floating-tab-bar';
import { ScreenHeader } from '@/components/common/screen-header';
import { ScreenLoader } from '@/components/common/screen-loader';
import { EmptyLog } from '@/components/logs/empty-log';
import { ILLUSTRATIONS } from '@/constants/illustrations';
import { SPACING } from '@/constants/layout';
import { useGoalErrorMessage, useGoals, type Goal } from '@/features/goals';
import { useAllowance } from '@/features/limits';
import { useTranslations } from '@/lib/i18n';

import { GoalStatusCard } from './goal-status-card';
import { HomeHeader } from './home-header';
import { HomeSection } from './home-section';

type ScoredGoal = Goal & { progress: NonNullable<Goal['progress']> };

const isScored = (goal: Goal): goal is ScoredGoal =>
  goal.progress !== undefined;

export function HomeScreen() {
  const { t } = useTranslations();
  const theme = useTheme();
  const toMessage = useGoalErrorMessage();
  const tabBarInset = useTabBarInset();
  const router = useRouter();
  const { canCreate } = useAllowance('goal');

  const goals = useGoals({ include: ['progress'] });

  const scored = (goals.data ?? []).filter(isScored);

  let empty = null;
  if (goals.isPending) {
    empty = <ScreenLoader />;
  } else if (!goals.error) {
    empty = (
      <EmptyLog
        Icon={Target}
        illustration={ILLUSTRATIONS.noGoals}
        title={t('goals.empty.title')}
        body={t('goals.empty.body')}
        action={canCreate ? t('goals.new') : undefined}
        onAction={() => router.push('/goals/new')}
      />
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.background.val }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarInset }}
      data={scored}
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
        <YStack gap={SPACING.section} pb={SPACING.items}>
          <YStack gap={SPACING.items} px={SPACING.screen}>
            <ScreenHeader>
              <HomeHeader today={scored[0]?.progress.today ?? null} />
            </ScreenHeader>
            <ErrorNotice message={toMessage(goals.error)} />
          </YStack>

          {scored.length > 0 && (
            <YStack px={SPACING.screen}>
              <HomeSection title={t('home.today.title')} />
            </YStack>
          )}
        </YStack>
      }
      ListEmptyComponent={empty}
      renderItem={({ item }) => (
        <YStack px={SPACING.screen} pb={SPACING.items}>
          <GoalStatusCard
            goal={item}
            progress={item.progress}
            onPress={() =>
              item.habitCount === 0
                ? router.push({
                    pathname: '/goals/[id]/habits/new',
                    params: { id: item.id },
                  })
                : router.push({
                    pathname: '/goals/[id]/check-in',
                    params: { id: item.id },
                  })
            }
          />
        </YStack>
      )}
    />
  );
}
