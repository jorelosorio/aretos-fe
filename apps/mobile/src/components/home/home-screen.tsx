import { FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@tamagui/core';
import { Target } from '@tamagui/lucide-icons-2';
import { YStack } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { useTabBarInset } from '@/components/common/floating-tab-bar';
import { ScreenLoader } from '@/components/common/screen-loader';
import { EmptyLog } from '@/components/logs/empty-log';
import { SPACING } from '@/constants/layout';
import { useGoalErrorMessage, useGoals, type Goal } from '@/features/goals';
import { useTranslations } from '@/lib/i18n';

import { GoalStatusCard } from './goal-status-card';
import { HomeHeader } from './home-header';
import { HomeSection } from './home-section';

const HEADER_TOP_GAP = 8;

type ScoredGoal = Goal & { progress: NonNullable<Goal['progress']> };

const isScored = (goal: Goal): goal is ScoredGoal =>
  goal.progress !== undefined;

export function HomeScreen() {
  const { t } = useTranslations();
  const theme = useTheme();
  const router = useRouter();
  const toMessage = useGoalErrorMessage();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();

  const goals = useGoals({ include: ['progress'] });

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
        <YStack
          gap={SPACING.section}
          pt={insets.top + HEADER_TOP_GAP}
          pb={SPACING.items}
        >
          <YStack gap={SPACING.group} px={SPACING.screen}>
            <HomeHeader />
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
