import { FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@tamagui/core';
import { Target } from '@tamagui/lucide-icons-2';
import { YStack } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { useTabBarInset } from '@/components/common/floating-tab-bar';
import { ScreenHeader } from '@/components/common/screen-header';
import { ScreenLoader } from '@/components/common/screen-loader';
import { PlanLimitNotice } from '@/components/goals/plan-limit-notice';
import { EmptyLog } from '@/components/logs/empty-log';
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
  const router = useRouter();
  const toMessage = useGoalErrorMessage();
  const tabBarInset = useTabBarInset();

  const goals = useGoals({ include: ['progress'] });

  const allowance = useAllowance('goal');
  const canCreate = allowance.canCreate;

  const scored = (goals.data ?? []).filter(isScored);

  const openLog = (goalId: string) =>
    router.push({ pathname: '/logs/[goalId]', params: { goalId } });

  let empty = null;
  if (goals.isPending) {
    empty = <ScreenLoader />;
  } else if (!goals.error) {
    empty = (
      <EmptyLog
        Icon={Target}
        title={t('home.empty.title')}
        body={t('home.empty.body')}
        action={t('home.empty.action')}
        onAction={() => router.push('/goals/new')}
        disabled={!canCreate}
        notice={
          canCreate ? undefined : <PlanLimitNotice allowance={allowance} />
        }
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
          <YStack gap={SPACING.group} px={SPACING.screen}>
            <ScreenHeader>
              <HomeHeader />
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
            onPress={() => openLog(item.id)}
          />
        </YStack>
      )}
    />
  );
}
