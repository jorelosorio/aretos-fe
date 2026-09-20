import { useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@tamagui/core';
import { Archive, Plus, Target } from '@tamagui/lucide-icons-2';
import { Button, Paragraph, SizableText, YStack } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { ScreenLoader } from '@/components/common/screen-loader';
import {
  SegmentedControl,
  type Segment,
} from '@/components/common/segmented-control';
import { SPACING } from '@/constants/layout';
import { useGoalErrorMessage, useGoals } from '@/features/goals';
import { useAllowance } from '@/features/limits';
import { useTranslations } from '@/lib/i18n';

import { GoalCard } from './goal-card';
import { PlanLimitNotice } from './plan-limit-notice';

type Filter = 'active' | 'archived';

export function GoalsScreen() {
  const { t } = useTranslations();
  const theme = useTheme();
  const router = useRouter();
  const toMessage = useGoalErrorMessage();

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
    <FlatList
      style={{ flex: 1, backgroundColor: theme.background.val }}
      contentContainerStyle={{ flexGrow: 1 }}
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
          gap={SPACING.section}
          px={SPACING.screen}
          pt={SPACING.screen}
          pb={SPACING.items}
        >
          <PlanLimitNotice allowance={allowance} />

          <SegmentedControl
            segments={segments}
            value={filter}
            onChange={setFilter}
          />

          <ErrorNotice message={toMessage(error)} />
        </YStack>
      }
      renderItem={({ item }) => (
        <YStack px={SPACING.screen} pb={SPACING.items}>
          <GoalCard
            goal={item}
            habitCount={item.habitCount}
            onPress={() =>
              router.push({
                pathname: '/goals/[id]',
                params: { id: item.id },
              })
            }
          />
        </YStack>
      )}
      ListEmptyComponent={
        isPending ? (
          <ScreenLoader />
        ) : (
          <YStack flex={1} px={SPACING.screen} pb={SPACING.screen}>
            <EmptyGoals
              Icon={archived ? Archive : Target}
              title={t(
                archived ? 'goals.empty.archivedTitle' : 'goals.empty.title',
              )}
              body={t(
                archived ? 'goals.empty.archivedBody' : 'goals.empty.body',
              )}
              onCreate={archived ? undefined : create}
              canCreate={canCreate}
            />
          </YStack>
        )
      }
      ListFooterComponent={
        !archived && (goals?.length ?? 0) > 0 ? (
          <YStack px={SPACING.screen} pb={SPACING.screen} pt={SPACING.items}>
            <Button
              size="$5"
              theme="accent"
              icon={Plus}
              disabled={!canCreate}
              opacity={canCreate ? 1 : 0.5}
              onPress={create}
            >
              {t('goals.new')}
            </Button>
          </YStack>
        ) : null
      }
    />
  );
}

function EmptyGoals({
  Icon,
  title,
  body,
  onCreate,
  canCreate = true,
}: {
  Icon: typeof Target;
  title: string;
  body: string;
  onCreate?: () => void;
  canCreate?: boolean;
}) {
  const { t } = useTranslations();

  return (
    <YStack
      flex={1}
      items="center"
      justify="center"
      gap={SPACING.section}
      p={SPACING.section}
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
    >
      <Icon size={32} color="$primary" />

      <YStack gap={SPACING.group} items="center">
        <SizableText
          size="$6"
          fontFamily="$heading"
          color="$cardForeground"
          text="center"
        >
          {title}
        </SizableText>
        <Paragraph size="$3" color="$mutedForeground" text="center">
          {body}
        </Paragraph>
      </YStack>

      {onCreate && (
        <Button
          size="$4"
          theme="accent"
          icon={Plus}
          disabled={!canCreate}
          opacity={canCreate ? 1 : 0.5}
          onPress={onCreate}
        >
          {t('goals.new')}
        </Button>
      )}
    </YStack>
  );
}
