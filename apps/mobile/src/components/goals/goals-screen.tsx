import { useState, useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@tamagui/core';
import { Archive } from '@tamagui/lucide-icons-2/icons/Archive';
import { Plus } from '@tamagui/lucide-icons-2/icons/Plus';
import { Target } from '@tamagui/lucide-icons-2/icons/Target';
import { YStack } from 'tamagui';

import { EmptyState } from '@/components/common/empty-state';
import { ErrorNotice } from '@/components/common/error-notice';
import { useTabBarInset } from '@/components/common/floating-tab-bar';
import { ScreenLoader } from '@/components/common/screen-loader';
import {
  SegmentedControl,
  type Segment,
} from '@/components/common/segmented-control';
import { ILLUSTRATIONS } from '@/components/common/illustrations';
import { SPACING } from '@/constants/layout';
import { useGoalErrorMessage, useGoals } from '@/features/goals/hooks';
import type { Goal } from '@/features/goals/types';
import { useAllowance } from '@/features/limits/hooks';
import { useTranslations } from '@/lib/i18n';

import { GoalCard } from './goal-card';
import { PlanLimitNotice } from './plan-limit-notice';

type Filter = 'active' | 'archived';

export function GoalsScreen() {
  const { t } = useTranslations();
  const theme = useTheme();
  const router = useRouter();

  const openGoal = useCallback(
    (goal: Goal) =>
      router.push({ pathname: '/goals/[id]', params: { id: goal.id } }),
    [router],
  );
  const toMessage = useGoalErrorMessage();
  const tabBarInset = useTabBarInset();

  const [filter, setFilter] = useState<Filter>('active');
  const archived = filter === 'archived';

  const allowance = useAllowance('goal');
  const canCreate = allowance.canCreate;

  const {
    data: goals,
    isPending,
    error,
    refetch,
    isRefetching,
  } = useGoals({ archived });

  const segments: readonly Segment<Filter>[] = [
    { value: 'active', label: t('goals.filter.active') },
    { value: 'archived', label: t('goals.filter.archived') },
  ];

  const create = () => router.push('/goals/new');

  return (
    <YStack flex={1} bg="$background">
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarInset }}
        data={goals ?? []}
        extraData={filter}
        keyExtractor={(goal) => goal.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={theme.primary.val}
            colors={[theme.primary.val]}
          />
        }
        ListHeaderComponent={
          <YStack
            gap={SPACING.items}
            px={SPACING.screen}
            pt={SPACING.screen}
            pb={SPACING.items}
          >
            <SegmentedControl
              segments={segments}
              value={filter}
              onChange={setFilter}
            />

            {!archived && <PlanLimitNotice allowance={allowance} />}

            <ErrorNotice message={toMessage(error)} />
          </YStack>
        }
        renderItem={({ item }) => (
          <YStack px={SPACING.screen} pb={SPACING.items}>
            <GoalCard
              goal={item}
              habitCount={item.habitCount}
              onOpen={openGoal}
            />
          </YStack>
        )}
        ListEmptyComponent={
          isPending ? (
            <ScreenLoader />
          ) : (
            <EmptyState
              Icon={archived ? Archive : Target}
              illustration={
                archived ? ILLUSTRATIONS.noArchived : ILLUSTRATIONS.noGoals
              }
              title={t(
                archived ? 'goals.empty.archivedTitle' : 'goals.empty.title',
              )}
              body={t(
                archived ? 'goals.empty.archivedBody' : 'goals.empty.body',
              )}
              action={
                archived || !canCreate
                  ? undefined
                  : { label: t('goals.new'), Icon: Plus, onPress: create }
              }
            />
          )
        }
      />
    </YStack>
  );
}
