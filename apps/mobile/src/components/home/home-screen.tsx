import { RefreshControl, SectionList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@tamagui/core';
import { Target } from '@tamagui/lucide-icons-2';
import { SizableText, YStack } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { useTabBarInset } from '@/components/common/floating-tab-bar';
import { ScreenHeader } from '@/components/common/screen-header';
import { ScreenLoader } from '@/components/common/screen-loader';
import { EmptyLog } from '@/components/logs/empty-log';
import { ILLUSTRATIONS } from '@/constants/illustrations';
import { SPACING, TEXT } from '@/constants/layout';
import { useGoalErrorMessage, useGoals, type Goal } from '@/features/goals';
import { useAllowance } from '@/features/limits';
import { useTranslations } from '@/lib/i18n';

import { GoalStatusCard } from './goal-status-card';
import { HomeHeader } from './home-header';
import { HomeSection } from './home-section';

type ScoredGoal = Goal & { progress: NonNullable<Goal['progress']> };

const isScored = (goal: Goal): goal is ScoredGoal =>
  goal.progress !== undefined;

export function HomeScreen() {
  const { t } = useTranslations();
  const theme = useTheme();
  const toMessage = useGoalErrorMessage();
  const tabBarInset = useTabBarInset();
  const router = useRouter();
  const { canCreate } = useAllowance('goal');

  const goals = useGoals({ include: ['progress'] });

  const scored = (goals.data ?? []).filter(isScored);
  const pending = scored.filter((goal) => !goal.progress.currentPeriod.logged);
  const logged = scored.filter((goal) => goal.progress.currentPeriod.logged);

  const sections = [
    { key: 'pending', title: t('home.sections.pending'), data: pending },
    { key: 'logged', title: t('home.sections.logged'), data: logged },
  ].filter((section) => section.data.length > 0);

  const open = (goal: Goal) =>
    goal.habitCount === 0
      ? router.push({
          pathname: '/goals/[id]/habits/new',
          params: { id: goal.id },
        })
      : router.push({
          pathname: '/goals/[id]/check-in',
          params: { id: goal.id },
        });

  let empty = null;
  if (goals.isPending) {
    empty = <ScreenLoader />;
  } else if (!goals.error) {
    empty = (
      <EmptyLog
        Icon={Target}
        illustration={ILLUSTRATIONS.noGoals}
        title={t('goals.empty.title')}
        body={t('goals.empty.body')}
        action={canCreate ? t('goals.new') : undefined}
        onAction={() => router.push('/goals/new')}
      />
    );
  }

  return (
    <SectionList
      style={{ flex: 1, backgroundColor: theme.background.val }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarInset }}
      sections={sections}
      keyExtractor={(goal) => goal.id}
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl
          refreshing={goals.isRefetching}
          onRefresh={() => void goals.refetch()}
          tintColor={theme.primary.val}
          colors={[theme.primary.val]}
        />
      }
      ListHeaderComponent={
        <YStack gap={SPACING.items} px={SPACING.screen} pb={SPACING.items}>
          <ScreenHeader>
            <HomeHeader
              today={scored[0]?.progress.today ?? null}
              summary={
                scored.length > 0
                  ? t('home.summary', {
                      logged: logged.length,
                      total: scored.length,
                    })
                  : undefined
              }
            />
          </ScreenHeader>
          <ErrorNotice message={toMessage(goals.error)} />
        </YStack>
      }
      ListEmptyComponent={empty}
      renderSectionHeader={({ section }) => (
        <YStack
          gap={SPACING.text}
          px={SPACING.screen}
          pt={SPACING.section}
          pb={SPACING.group}
        >
          <HomeSection title={section.title} />

          {section.key === 'logged' && pending.length === 0 && (
            <SizableText size={TEXT.body} color="$mutedForeground">
              {t('home.allLogged')}
            </SizableText>
          )}
        </YStack>
      )}
      renderItem={({ item }) => (
        <YStack px={SPACING.screen} pb={SPACING.items}>
          <GoalStatusCard
            goal={item}
            progress={item.progress}
            onPress={() => open(item)}
          />
        </YStack>
      )}
    />
  );
}
