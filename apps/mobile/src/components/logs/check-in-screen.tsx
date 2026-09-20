import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
} from '@tamagui/lucide-icons-2';
import {
  Button,
  Paragraph,
  ScrollView,
  Separator,
  SizableText,
  TextArea,
  XStack,
  YStack,
} from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { ScreenLoader } from '@/components/common/screen-loader';
import { SectionTitle } from '@/components/common/section-title';
import { SPACING } from '@/constants/layout';
import {
  useGoalCheckIn,
  useGoalErrorMessage,
  type Goal,
  type GoalPeriod,
} from '@/features/goals';
import type { Habit } from '@/features/habits';
import {
  shiftPeriod,
  todayKey,
  useLogDraft,
  useLogErrorMessage,
} from '@/features/logs';
import { useTranslations } from '@/lib/i18n';

import { EmptyLog } from './empty-log';
import { HabitEntryCard } from './habit-entry-card';
import { MoodPicker } from './mood-picker';
import { periodLabel } from './period-label';

const NOTE_MAX = 2000;

function PeriodBar({
  label,
  canGoForward,
  onPrevious,
  onNext,
}: {
  label: string;
  canGoForward: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslations();

  return (
    <XStack
      items="center"
      justify="space-between"
      p="$2"
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
    >
      <Button
        size="$3"
        circular
        chromeless
        onPress={onPrevious}
        icon={<ChevronLeft size={20} color="$color" />}
        accessibilityLabel={t('logs.period.previous')}
      />

      <SizableText size="$4" fontFamily="$heading" color="$cardForeground">
        {label}
      </SizableText>

      <Button
        size="$3"
        circular
        chromeless
        disabled={!canGoForward}
        opacity={canGoForward ? 1 : 0.3}
        onPress={onNext}
        icon={<ChevronRight size={20} color="$color" />}
        accessibilityLabel={t('logs.period.next')}
      />
    </XStack>
  );
}

function CheckInForm({
  goal,
  habits,
  period,
  today,
  isLoaded,
  onDateChange,
}: {
  goal: Goal;
  habits: Habit[];
  period: GoalPeriod;
  today: string;
  isLoaded: boolean;
  onDateChange: (date: string) => void;
}) {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const toMessage = useLogErrorMessage();

  const draft = useLogDraft({
    goalId: goal.id,
    habits,
    entryDate: period.entryDate,
    existing: period.logged ? period : undefined,
    isLoaded,
  });

  const frequency = goal.trackingFrequency;
  const next = shiftPeriod(period.entryDate, frequency, 1);
  const canGoForward = next <= today;

  const busy = draft.isLoading || draft.isSaving;

  const save = () =>
    void draft
      .save()
      .then(() => router.back())
      .catch(() => undefined);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <YStack flex={1} bg="$background">
        <ScrollView
          flex={1}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ grow: 1 }}
        >
          <YStack p={SPACING.screen} gap={SPACING.section}>
            <PeriodBar
              label={periodLabel(period.entryDate, frequency, locale, t)}
              canGoForward={canGoForward}
              onPrevious={() =>
                onDateChange(shiftPeriod(period.entryDate, frequency, -1))
              }
              onNext={() => onDateChange(next)}
            />

            {period.logged && (
              <XStack items="center" gap="$2" px="$2">
                <Check size={14} color="$primary" />
                <SizableText size="$2" color="$mutedForeground">
                  {t('logs.editing')}
                </SizableText>
              </XStack>
            )}

            <ErrorNotice message={toMessage(draft.saveError)} />

            {draft.isLoading ? (
              <ScreenLoader />
            ) : (
              <>
                <YStack gap={SPACING.items}>
                  {habits.map((habit) => (
                    <HabitEntryCard
                      key={habit.id}
                      habit={habit}
                      entry={draft.entryFor(habit.id)}
                      onChange={(patch) => draft.setEntry(habit.id, patch)}
                      onToggleSkip={() => draft.toggleSkip(habit.id)}
                    />
                  ))}
                </YStack>

                <Separator borderColor="$border" />

                <MoodPicker value={draft.mood} onChange={draft.setMood} />

                <YStack gap={SPACING.group}>
                  <SectionTitle>{t('logs.note')}</SectionTitle>
                  <TextArea
                    size="$5"
                    value={draft.note}
                    onChangeText={draft.setNote}
                    placeholder={t('logs.notePlaceholder')}
                    placeholderTextColor="$mutedForeground"
                    maxLength={NOTE_MAX}
                    multiline
                    numberOfLines={3}
                    minH={96}
                    verticalAlign="top"
                    bg="$card"
                    borderColor="$border"
                  />
                  <Paragraph size="$2" color="$mutedForeground" px="$2">
                    {t('logs.optional')}
                  </Paragraph>
                </YStack>
              </>
            )}
          </YStack>
        </ScrollView>

        <YStack
          gap={SPACING.group}
          p={SPACING.screen}
          bg="$card"
          borderTopWidth={1}
          borderTopColor="$border"
        >
          <SizableText size="$2" color="$mutedForeground" text="center">
            {t('logs.progress', {
              answered: draft.answered,
              total: draft.total,
            })}
          </SizableText>

          <Button
            size="$5"
            theme="accent"
            onPress={save}
            disabled={busy}
            opacity={busy ? 0.7 : 1}
          >
            {t(period.logged ? 'logs.update' : 'logs.save')}
          </Button>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}

export function CheckInScreen({
  goalId,
  date: opensOn,
}: {
  goalId: string;
  date?: string;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const toMessage = useGoalErrorMessage();

  const [date, setDate] = useState(opensOn ?? todayKey());
  const { data: goal, isPending, error } = useGoalCheckIn(goalId, date);

  const period = goal?.progress?.periods[0] ?? goal?.progress?.currentPeriod;
  const habits = goal?.habits;

  if (error) {
    return (
      <YStack flex={1} p={SPACING.screen} bg="$background">
        <ErrorNotice message={toMessage(error)} />
      </YStack>
    );
  }

  if (isPending || !goal || !habits || !period) return <ScreenLoader />;

  if (habits.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: goal.name }} />
        <EmptyLog
          Icon={Plus}
          title={t('logs.empty.noHabitsTitle')}
          body={t('logs.empty.noHabitsBody')}
          action={t('logs.empty.noHabitsAction')}
          onAction={() =>
            router.replace({
              pathname: '/goals/[id]/habits/new',
              params: { id: goal.id },
            })
          }
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: goal.name }} />
      <CheckInForm
        goal={goal}
        habits={habits}
        period={period}
        today={goal.progress?.today ?? date}
        isLoaded
        onDateChange={setDate}
      />
    </>
  );
}
