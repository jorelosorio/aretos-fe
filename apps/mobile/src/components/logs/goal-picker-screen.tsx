import { Redirect, useRouter } from 'expo-router';
import { Target } from '@tamagui/lucide-icons-2';
import { useTheme } from '@tamagui/core';
import { FlatList } from 'react-native';
import { YStack } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { ScreenLoader } from '@/components/common/screen-loader';
import { SectionTitle } from '@/components/common/section-title';
import { GoalCard } from '@/components/goals/goal-card';
import { ILLUSTRATIONS } from '@/constants/illustrations';
import { SPACING } from '@/constants/layout';
import { useGoalErrorMessage, useGoals } from '@/features/goals';
import { useAllowance } from '@/features/limits';
import { useTranslations } from '@/lib/i18n';

import { EmptyLog } from './empty-log';

export function GoalPickerScreen() {
  const { t } = useTranslations();
  const theme = useTheme();
  const router = useRouter();
  const toMessage = useGoalErrorMessage();

  const { data: goals, isPending, error } = useGoals();
  const { canCreate } = useAllowance('goal');

  const open = (goalId: string) =>
    router.replace({ pathname: '/logs/[goalId]', params: { goalId } });

  if (isPending) return <ScreenLoader />;

  if (error) {
    return (
      <YStack flex={1} p={SPACING.screen} bg="$background">
        <ErrorNotice message={toMessage(error)} />
      </YStack>
    );
  }

  if (goals.length === 0) {
    return (
      <EmptyLog
        Icon={Target}
        illustration={ILLUSTRATIONS.noGoals}
        title={t('goals.empty.title')}
        body={t('goals.empty.body')}
        action={canCreate ? t('goals.new') : undefined}
        onAction={() => router.replace('/goals/new')}
      />
    );
  }

  if (goals.length === 1) {
    return (
      <Redirect
        href={{ pathname: '/logs/[goalId]', params: { goalId: goals[0].id } }}
      />
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.background.val }}
      contentContainerStyle={{ flexGrow: 1 }}
      data={goals}
      keyExtractor={(goal) => goal.id}
      ListHeaderComponent={
        <YStack px={SPACING.screen} pt={SPACING.screen} pb={SPACING.items}>
          <SectionTitle>{t('logs.pickGoal')}</SectionTitle>
        </YStack>
      }
      renderItem={({ item }) => (
        <YStack px={SPACING.screen} pb={SPACING.items}>
          <GoalCard
            goal={item}
            habitCount={item.habitCount}
            onPress={() => open(item.id)}
          />
        </YStack>
      )}
    />
  );
}
