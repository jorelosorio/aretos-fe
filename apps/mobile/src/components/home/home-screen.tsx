import { FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { useGoalStreaks } from '@/features/streaks';
import { useTranslations } from '@/lib/i18n';

import { GoalStatusCard } from './goal-status-card';
import { HomeHeader } from './home-header';
import { HomeSection } from './home-section';
import { toGoalStatus } from './today-status';
import { currentWeekWindow } from './week-days';

const HEADER_TOP_GAP = 8;

export function HomeScreen() {
  const { t } = useTranslations();
  const theme = useTheme();
  const router = useRouter();
  const toMessage = useGoalErrorMessage();
  const insets = useSafeAreaInsets();

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

  const streaks = useGoalStreaks(statuses.map((status) => status.goal.id));

  const openLog = (goalId: string) =>
    router.push({ pathname: '/logs/[goalId]', params: { goalId } });

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
          gap={SPACING.section}
          pt={insets.top + HEADER_TOP_GAP}
          pb={SPACING.items}
        >
          <YStack gap={SPACING.group} px={SPACING.screen}>
            <HomeHeader />
            <ErrorNotice message={toMessage(error)} />
          </YStack>

          <YStack px={SPACING.screen}>
            <HomeSection title={t('home.today.title')} />
          </YStack>
        </YStack>
      }
      renderItem={({ item }) => (
        <YStack px={SPACING.screen} pb={SPACING.items}>
          <GoalStatusCard
            status={item}
            streak={streaks[item.goal.id] ?? 0}
            onPress={() => openLog(item.goal.id)}
          />
        </YStack>
      )}
    />
  );
}
