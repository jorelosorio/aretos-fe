import { FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@tamagui/core';
import { Archive, ListChecks, Plus } from '@tamagui/lucide-icons-2';
import {
  Button,
  Circle,
  Paragraph,
  Separator,
  SizableText,
  XStack,
  YStack,
} from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { ScreenLoader } from '@/components/common/screen-loader';
import { SectionTitle } from '@/components/common/section-title';
import { HabitCard } from '@/components/habits/habit-card';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { Goal } from '@/features/goals';
import { useHabitErrorMessage, useHabits } from '@/features/habits';
import { useAllowance } from '@/features/limits';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import { slotColor } from './slot-color';

const FREQUENCY_LABELS: Record<Goal['trackingFrequency'], TranslationKey> = {
  daily: 'goals.frequency.daily',
  weekly: 'goals.frequency.weekly',
  flexible: 'goals.frequency.flexible',
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <YStack flex={1} gap={SPACING.text}>
      <SizableText size="$1" color="$mutedForeground" letterSpacing={0.6}>
        {label.toUpperCase()}
      </SizableText>
      <SizableText size="$5" fontFamily="$heading" color="$cardForeground">
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
    <YStack
      gap={SPACING.items}
      p={SPACING.card}
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
    >
      <XStack items="center" gap={SPACING.items}>
        <Circle size={12} bg={slotColor(goal.colorSlot)} />
        <SizableText
          flex={1}
          size="$6"
          fontFamily="$heading"
          color="$cardForeground"
        >
          {goal.name}
        </SizableText>
      </XStack>

      {goal.description !== '' && (
        <Paragraph size={TEXT.body} color="$mutedForeground">
          {goal.description}
        </Paragraph>
      )}

      <Separator borderColor="$border" />

      <XStack gap={SPACING.items}>
        <Stat label={t('goals.stats.habits')} value={String(habitCount)} />
        <Stat
          label={t('goals.stats.frequency')}
          value={t(FREQUENCY_LABELS[goal.trackingFrequency])}
        />
        <Stat label={t('goals.stats.streak')} value={streak} />
      </XStack>
    </YStack>
  );
}

function ArchivedNotice() {
  const { t } = useTranslations();

  return (
    <XStack
      gap={SPACING.items}
      p={SPACING.card}
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
    >
      <YStack
        width={36}
        height={36}
        items="center"
        justify="center"
        rounded="$xl"
        bg="$muted"
      >
        <Archive size={ICON.row} color="$primary" />
      </YStack>

      <YStack flex={1} gap={SPACING.text}>
        <SizableText size="$4" fontFamily="$heading" color="$cardForeground">
          {t('goals.archivedNotice.title')}
        </SizableText>
        <Paragraph size={TEXT.body} color="$mutedForeground">
          {t('goals.archivedNotice.body')}
        </Paragraph>
      </YStack>
    </XStack>
  );
}

export function GoalDetail({ goal }: { goal: Goal }) {
  const { t } = useTranslations();
  const theme = useTheme();
  const router = useRouter();
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

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.background.val }}
      contentContainerStyle={{ flexGrow: 1 }}
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
          pb={SPACING.items}
        >
          <GoalSummary goal={goal} habitCount={habits?.length ?? 0} />

          {goal.archived && <ArchivedNotice />}

          <ErrorNotice message={toMessage(error)} />

          <SectionTitle>{t('habits.section')}</SectionTitle>
        </YStack>
      }
      renderItem={({ item }) => (
        <YStack px={SPACING.screen} pb={SPACING.items}>
          <HabitCard
            habit={item}
            onPress={
              goal.archived
                ? undefined
                : () =>
                    router.push({
                      pathname: '/habits/[id]',
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
          <YStack px={SPACING.screen}>
            <EmptyHabits />
          </YStack>
        )
      }
      ListFooterComponent={
        goal.archived ? null : (
          <YStack px={SPACING.screen} pb={SPACING.screen} pt={SPACING.items}>
            <Button
              size="$5"
              theme="accent"
              icon={Plus}
              disabled={!canCreate}
              opacity={canCreate ? 1 : 0.5}
              onPress={addHabit}
            >
              {t('habits.new')}
            </Button>
          </YStack>
        )
      }
    />
  );
}

function EmptyHabits() {
  const { t } = useTranslations();

  return (
    <YStack items="center" gap={SPACING.group} p={SPACING.section}>
      <ListChecks size={28} color="$primary" />
      <SizableText size="$5" fontFamily="$heading" color="$color" text="center">
        {t('habits.empty.title')}
      </SizableText>
      <Paragraph size={TEXT.body} color="$mutedForeground" text="center">
        {t('habits.empty.body')}
      </Paragraph>
    </YStack>
  );
}
