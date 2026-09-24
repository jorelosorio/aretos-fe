import { FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@tamagui/core';
import { Archive, ListChecks, Plus } from '@tamagui/lucide-icons-2';
import {
  Button,
  Paragraph,
  Separator,
  SizableText,
  XStack,
  YStack,
} from 'tamagui';

import { EmptyArt } from '@/components/common/empty-art';
import { ErrorNotice } from '@/components/common/error-notice';
import { ScreenLoader } from '@/components/common/screen-loader';
import { SectionTitle } from '@/components/common/section-title';
import { HabitCard } from '@/components/habits/habit-card';
import { BUTTON, ICON, SPACING, TEXT } from '@/constants/layout';

import { GoalDot } from './goal-dot';
import type { Goal } from '@/features/goals';
import { useHabitErrorMessage, useHabits } from '@/features/habits';
import { useAllowance } from '@/features/limits';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

const FREQUENCY_LABELS: Record<Goal['trackingFrequency'], TranslationKey> = {
  daily: 'goals.frequency.daily',
  weekly: 'goals.frequency.weekly',
  flexible: 'goals.frequency.flexible',
};

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
    <YStack
      gap={SPACING.items}
      p={SPACING.card}
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
    >
      <XStack items="center" gap={SPACING.group}>
        <GoalDot slot={goal.colorSlot} size={14} />
        <SizableText
          flex={1}
          size={TEXT.title}
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
        <SizableText
          size={TEXT.heading}
          fontWeight="700"
          color="$cardForeground"
        >
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
              <EmptyHabits onCreate={canAdd ? addHabit : undefined} />
            </YStack>
          )
        }
      />
    </YStack>
  );
}

function EmptyHabits({ onCreate }: { onCreate?: () => void }) {
  const { t } = useTranslations();

  return (
    <YStack items="center" gap={SPACING.group} p={SPACING.section}>
      <EmptyArt Icon={ListChecks} />
      <SizableText
        size={TEXT.title}
        fontWeight="700"
        color="$color"
        text="center"
      >
        {t('habits.empty.title')}
      </SizableText>
      <Paragraph size={TEXT.body} color="$mutedForeground" text="center">
        {t('habits.empty.body')}
      </Paragraph>

      {onCreate && (
        <YStack pt={SPACING.group}>
          <Button
            size={BUTTON.primary}
            theme="accent"
            icon={Plus}
            onPress={onCreate}
          >
            {t('habits.new')}
          </Button>
        </YStack>
      )}
    </YStack>
  );
}
