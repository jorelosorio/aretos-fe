import { useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@tamagui/core';
import { Archive, ListChecks, Plus } from '@tamagui/lucide-icons-2';
import { Paragraph, Separator, SizableText, XStack, YStack } from 'tamagui';

import { Card } from '@/components/common/card';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorNotice } from '@/components/common/error-notice';
import { Notice } from '@/components/common/notice';
import { ScreenLoader } from '@/components/common/screen-loader';
import { SectionTitle } from '@/components/common/section-title';
import { HabitCard } from '@/components/habits/habit-card';
import { TagChips } from '@/components/tags/tag-chips';
import { SPACING, TEXT } from '@/constants/layout';

import { FREQUENCY_LABELS } from './frequency-labels';
import { GoalName } from './goal-name';
import type { Goal } from '@/features/goals';
import { useHabitErrorMessage, useHabits, type Habit } from '@/features/habits';
import { useAllowance } from '@/features/limits';
import { useTranslations } from '@/lib/i18n';

const FOOTER_SPACE = 16;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <YStack flex={1} gap={SPACING.text}>
      <SizableText size={TEXT.caption} color="$mutedForeground">
        {label}
      </SizableText>
      <SizableText size={TEXT.body} fontWeight="700" color="$cardForeground">
        {value}
      </SizableText>
    </YStack>
  );
}

function GoalSummary({ goal, habitCount }: { goal: Goal; habitCount: number }) {
  const { t } = useTranslations();

  const streak =
    goal.streakRule === 'threshold'
      ? `${goal.streakThreshold}%`
      : t('goals.streak.loggedShort');

  return (
    <Card>
      <YStack gap={SPACING.text}>
        <GoalName slot={goal.colorSlot} name={goal.name} />

        {goal.description !== '' && (
          <Paragraph size={TEXT.body} color="$mutedForeground">
            {goal.description}
          </Paragraph>
        )}
      </YStack>

      <TagChips tags={goal.tags} />

      <Separator borderColor="$border" />

      <XStack gap={SPACING.items}>
        <Stat label={t('goals.stats.habits')} value={String(habitCount)} />
        <Stat
          label={t('goals.stats.frequency')}
          value={t(FREQUENCY_LABELS[goal.trackingFrequency])}
        />
        <Stat label={t('goals.stats.streak')} value={streak} />
      </XStack>
    </Card>
  );
}

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
            <GoalSummary goal={goal} habitCount={habits?.length ?? 0} />

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
