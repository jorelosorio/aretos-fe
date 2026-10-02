import { useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@tamagui/core';
import { Archive } from '@tamagui/lucide-icons-2/icons/Archive';
import { ListChecks } from '@tamagui/lucide-icons-2/icons/ListChecks';
import { Plus } from '@tamagui/lucide-icons-2/icons/Plus';
import { YStack } from 'tamagui';

import { EmptyState } from '@/components/common/empty-state';
import { ILLUSTRATIONS } from '@/components/common/illustrations';
import { ErrorNotice } from '@/components/common/error-notice';
import { Notice } from '@/components/common/notice';
import { ScreenLoader } from '@/components/common/screen-loader';
import { SectionTitle } from '@/components/common/section-title';
import { HabitCard } from '@/components/habits/habit-card';
import { GoalTemplateLink } from '@/components/templates/goal-template-link';
import { SPACING } from '@/constants/layout';

import { GoalSummary } from './goal-summary';
import type { Goal } from '@/features/goals/types';
import { useHabitErrorMessage, useHabits } from '@/features/habits/hooks';
import type { Habit } from '@/features/habits/types';
import { useAllowance } from '@/features/limits/hooks';
import { useTranslations } from '@/lib/i18n';

const FOOTER_SPACE = 16;

export function GoalDetail({ goal }: { goal: Goal }) {
  const { t } = useTranslations();
  const theme = useTheme();
  const router = useRouter();

  const openHabit = useCallback(
    (habit: Habit) =>
      router.push({ pathname: '/habits/[id]', params: { id: habit.id } }),
    [router],
  );
  const insets = useSafeAreaInsets();
  const toMessage = useHabitErrorMessage();

  const allowance = useAllowance('habit');
  const canCreate = allowance.canCreate;

  const {
    data: habits,
    isPending,
    error,
    refetch,
    isRefetching,
  } = useHabits(goal.id);

  const addHabit = () =>
    router.push({
      pathname: '/goals/[id]/habits/new',
      params: { id: goal.id },
    });

  const canAdd = !goal.archived && canCreate;

  return (
    <YStack flex={1} bg="$background">
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + FOOTER_SPACE,
        }}
        data={habits ?? []}
        keyExtractor={(habit) => habit.id}
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
            gap={SPACING.section}
            px={SPACING.screen}
            pt={SPACING.screen}
            pb={SPACING.group}
          >
            <GoalSummary
              name={goal.name}
              slot={goal.colorSlot}
              description={goal.description}
              tags={goal.tags}
              habitCount={habits?.length ?? 0}
              trackingFrequency={goal.trackingFrequency}
              streakRule={goal.streakRule}
              streakThreshold={goal.streakThreshold}
            />

            {goal.templateId !== null && (
              <GoalTemplateLink templateId={goal.templateId} />
            )}

            {goal.archived && (
              <Notice
                Icon={Archive}
                title={t('goals.archivedNotice.title')}
                body={t('goals.archivedNotice.body')}
              />
            )}

            <ErrorNotice message={toMessage(error)} />

            <SectionTitle>{t('habits.section')}</SectionTitle>
          </YStack>
        }
        renderItem={({ item }) => (
          <YStack px={SPACING.screen} pb={SPACING.items}>
            <HabitCard
              habit={item}
              onOpen={goal.archived ? undefined : openHabit}
            />
          </YStack>
        )}
        ListEmptyComponent={
          isPending ? (
            <ScreenLoader />
          ) : (
            <YStack px={SPACING.screen}>
              <EmptyState
                compact
                Icon={ListChecks}
                illustration={ILLUSTRATIONS.noHabits}
                title={t('habits.empty.title')}
                body={t('habits.empty.body')}
                action={
                  canAdd
                    ? { label: t('habits.new'), Icon: Plus, onPress: addHabit }
                    : undefined
                }
              />
            </YStack>
          )
        }
      />
    </YStack>
  );
}
