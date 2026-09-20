import { FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@tamagui/core';
import { Target } from '@tamagui/lucide-icons-2';
import { YStack } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { ScreenLoader } from '@/components/common/screen-loader';
import { EmptyLog } from '@/components/logs/empty-log';
import { SPACING } from '@/constants/layout';
import { useGoalErrorMessage, useGoals } from '@/features/goals';
import { useHabits } from '@/features/habits';
import { useLogs } from '@/features/logs';
import { useTranslations } from '@/lib/i18n';

import { GoalStatusCard } from './goal-status-card';
import { toGoalStatus } from './today-status';
import { currentWeekWindow } from './week-days';

export function HomeScreen() {
  const { t } = useTranslations();
  const theme = useTheme();
  const router = useRouter();
  const toMessage = useGoalErrorMessage();

  const goals = useGoals();
  const habits = useHabits();
  const logs = useLogs(currentWeekWindow());

  const isPending = goals.isPending || habits.isPending || logs.isPending;
  const error = goals.error ?? habits.error ?? logs.error;

  const refresh = () => {
    void goals.refetch();
    void habits.refetch();
    void logs.refetch();
  };

  const statuses = toGoalStatus(
    goals.data ?? [],
    habits.data ?? [],
    logs.data ?? [],
  );

  if (isPending) return <ScreenLoader />;

  if (!error && statuses.length === 0) {
    return (
      <EmptyLog
        Icon={Target}
        title={t('home.empty.title')}
        body={t('home.empty.body')}
        action={t('home.empty.action')}
        onAction={() => router.push('/goals/new')}
      />
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.background.val }}
      contentContainerStyle={{ flexGrow: 1 }}
      data={statuses}
      keyExtractor={(status) => status.goal.id}
      refreshControl={
        <RefreshControl
          refreshing={goals.isRefetching || logs.isRefetching}
          onRefresh={refresh}
          tintColor={theme.primary.val}
          colors={[theme.primary.val]}
        />
      }
      ListHeaderComponent={
        <YStack
          gap={SPACING.group}
          px={SPACING.screen}
          pt={SPACING.screen}
          pb={SPACING.items}
        >
          <ErrorNotice message={toMessage(error)} />
        </YStack>
      }
      renderItem={({ item }) => (
        <YStack px={SPACING.screen} pb={SPACING.items}>
          <GoalStatusCard
            status={item}
            onPress={() =>
              router.push({
                pathname: '/logs/[goalId]',
                params: { goalId: item.goal.id },
              })
            }
          />
        </YStack>
      )}
    />
  );
}
