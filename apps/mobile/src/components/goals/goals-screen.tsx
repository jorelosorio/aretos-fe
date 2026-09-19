import { useState } from 'react';
import { RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@tamagui/core';
import { Archive, Plus, Target } from '@tamagui/lucide-icons-2';
import { Button, Paragraph, ScrollView, SizableText, YStack } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { ScreenLoader } from '@/components/common/screen-loader';
import {
  SegmentedControl,
  type Segment,
} from '@/components/common/segmented-control';
import { SPACING } from '@/constants/layout';
import { useGoalErrorMessage, useGoals } from '@/features/goals';
import { useTranslations } from '@/lib/i18n';

import { GoalCard } from './goal-card';

type Filter = 'active' | 'archived';

export function GoalsScreen() {
  const { t } = useTranslations();
  const theme = useTheme();
  const router = useRouter();
  const toMessage = useGoalErrorMessage();

  const [filter, setFilter] = useState<Filter>('active');
  const archived = filter === 'archived';

  const {
    data: goals,
    isPending,
    error,
    refetch,
    isRefetching,
  } = useGoals(archived);

  const segments: readonly Segment<Filter>[] = [
    { value: 'active', label: t('goals.filter.active') },
    { value: 'archived', label: t('goals.filter.archived') },
  ];

  return (
    <ScrollView
      flex={1}
      bg="$background"
      contentContainerStyle={{ grow: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          tintColor={theme.primary.val}
          colors={[theme.primary.val]}
        />
      }
    >
      <YStack flex={1} p={SPACING.screen} gap={SPACING.section}>
        <SegmentedControl
          segments={segments}
          value={filter}
          onChange={setFilter}
        />

        <ErrorNotice message={toMessage(error)} />

        {isPending ? (
          <ScreenLoader />
        ) : goals?.length === 0 ? (
          <EmptyGoals
            Icon={archived ? Archive : Target}
            title={t(
              archived ? 'goals.empty.archivedTitle' : 'goals.empty.title',
            )}
            body={t(archived ? 'goals.empty.archivedBody' : 'goals.empty.body')}
            onCreate={archived ? undefined : () => router.push('/goals/new')}
          />
        ) : (
          <>
            <YStack gap={SPACING.items}>
              {goals?.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onPress={() =>
                    router.push({
                      pathname: '/goals/[id]',
                      params: { id: goal.id },
                    })
                  }
                />
              ))}
            </YStack>

            {!archived && (
              <Button
                size="$5"
                theme="accent"
                icon={Plus}
                onPress={() => router.push('/goals/new')}
              >
                {t('goals.new')}
              </Button>
            )}
          </>
        )}
      </YStack>
    </ScrollView>
  );
}

function EmptyGoals({
  Icon,
  title,
  body,
  onCreate,
}: {
  Icon: typeof Target;
  title: string;
  body: string;
  onCreate?: () => void;
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
        <Button size="$4" theme="accent" icon={Plus} onPress={onCreate}>
          {t('goals.new')}
        </Button>
      )}
    </YStack>
  );
}
