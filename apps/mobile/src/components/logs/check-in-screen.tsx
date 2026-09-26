import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Check, Plus } from '@tamagui/lucide-icons-2';
import { SizableText, XStack, YStack } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { FormScrollView } from '@/components/common/form-scroll-view';
import { HeaderTextButton } from '@/components/common/header-actions';
import { ScreenLoader } from '@/components/common/screen-loader';
import { SectionTitle } from '@/components/common/section-title';
import { GoalHeaderTitle } from '@/components/goals/goal-header-title';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import {
  useGoalCheckIn,
  useGoalErrorMessage,
  type Goal,
  type GoalPeriod,
} from '@/features/goals';
import type { Habit } from '@/features/habits';
import { useLogDraft, useLogErrorMessage, type DateKey } from '@/features/logs';
import { useTranslations } from '@/lib/i18n';

import { CheckInNotes } from './check-in-notes';
import { EmptyLog } from './empty-log';
import { HabitTrackRow } from './habit-track-row';
import { MoodPicker } from './mood-picker';
import { periodLabel } from './period-label';
import { WeekPicker } from './week-picker';

function CheckInForm({
  goal,
  habits,
  periods,
  period,
  periodDate,
  selected,
  today,
  current,
  onSelect,
}: {
  goal: Goal;
  habits: Habit[];
  periods: readonly GoalPeriod[];
  period: GoalPeriod | undefined;
  periodDate: DateKey;
  selected: DateKey;
  today: DateKey;
  current: DateKey;
  onSelect: (date: DateKey) => void;
}) {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const toMessage = useLogErrorMessage();

  const draft = useLogDraft({
    goalId: goal.id,
    habits,
    entryDate: periodDate,
    existing: period?.logged ? period : undefined,
    isLoaded: period !== undefined,
  });

  const heading = periodLabel(
    periodDate,
    current,
    goal.trackingFrequency,
    locale,
    t,
  );

  const save = () =>
    void draft
      .save()
      .then((complete) => {
        if (complete) router.back();
      })
      .catch(() => undefined);

  const pick = (next: DateKey) => {
    if (next === selected || draft.isSaving) return;
    if (!draft.isDirty) {
      onSelect(next);
      return;
    }

    void draft
      .save()
      .then((complete) => {
        if (complete) onSelect(next);
      })
      .catch(() => undefined);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: goal.name,
          headerTitle: ({ children, tintColor }) => (
            <GoalHeaderTitle
              slot={goal.colorSlot}
              title={children}
              color={tintColor}
            />
          ),
          headerRight: () => (
            <HeaderTextButton
              label={t(period?.logged === true ? 'logs.update' : 'logs.save')}
              onPress={save}
              disabled={draft.isLoading}
              busy={draft.isSaving}
            />
          ),
        }}
      />

      <YStack flex={1} bg="$background">
        <FormScrollView>
          <YStack p={SPACING.screen} gap={SPACING.section}>
            <WeekPicker
              frequency={goal.trackingFrequency}
              periods={periods}
              selected={selected}
              today={today}
              createdOn={goal.createdAt.slice(0, 10)}
              onSelect={pick}
            />

            <YStack gap={SPACING.text}>
              <XStack
                items="center"
                justify="space-between"
                gap={SPACING.items}
              >
                <SectionTitle>{heading}</SectionTitle>

                {!draft.isLoading && (
                  <SizableText
                    size={TEXT.caption}
                    fontWeight="600"
                    color="$mutedForeground"
                  >
                    {t('logs.progress', {
                      answered: draft.answered,
                      total: draft.total,
                    })}
                  </SizableText>
                )}
              </XStack>

              {period?.logged === true && (
                <XStack items="center" gap="$2">
                  <Check size={ICON.inline} color="$primary" />
                  <SizableText size={TEXT.caption} color="$mutedForeground">
                    {t('logs.editing')}
                  </SizableText>
                </XStack>
              )}
            </YStack>

            <ErrorNotice message={toMessage(draft.saveError)} />

            {draft.isLoading ? (
              <ScreenLoader />
            ) : (
              <>
                <YStack>
                  {habits.map((habit, position) => (
                    <HabitTrackRow
                      key={habit.id}
                      habit={habit}
                      entry={draft.entryFor(habit.id)}
                      isFirst={position === 0}
                      isLast={position === habits.length - 1}
                      onChange={(patch) => draft.setEntry(habit.id, patch)}
                      onToggleSkip={() => draft.toggleSkip(habit.id)}
                    />
                  ))}
                </YStack>

                <MoodPicker value={draft.mood} onChange={draft.setMood} />

                <CheckInNotes
                  logId={period?.logId ?? null}
                  title={goal.name}
                  subtitle={heading}
                  pending={draft.pending}
                  onAddPending={draft.addPending}
                  onUpdatePending={draft.updatePending}
                  onRemovePending={draft.removePending}
                  busy={draft.isSaving}
                />
              </>
            )}
          </YStack>
        </FormScrollView>
      </YStack>
    </>
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

  const [picked, setPicked] = useState(opensOn);
  const [anchor, setAnchor] = useState(opensOn);

  const { data: goal, isPending, error } = useGoalCheckIn(goalId, anchor);

  const habits = goal?.habits;
  const progress = goal?.progress;

  if (error) {
    return (
      <YStack flex={1} p={SPACING.screen} bg="$background">
        <ErrorNotice message={toMessage(error)} />
      </YStack>
    );
  }

  if (isPending || !goal || !habits || !progress) return <ScreenLoader />;

  if (habits.length === 0) {
    return (
      <>
        <Stack.Screen
          options={{
            title: goal.name,
            headerTitle: ({ children, tintColor }) => (
              <GoalHeaderTitle
                slot={goal.colorSlot}
                title={children}
                color={tintColor}
              />
            ),
          }}
        />
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

  const periods = progress.periods;
  const selected = picked ?? progress.today;

  const period = periods.find(
    (entry) => entry.entryDate <= selected && selected <= entry.endDate,
  );

  const select = (day: DateKey) => {
    setPicked(day);
    if (day < progress.from || day > progress.to) setAnchor(day);
  };

  return (
    <CheckInForm
      goal={goal}
      habits={habits}
      periods={periods}
      period={period}
      periodDate={period?.entryDate ?? selected}
      selected={selected}
      today={progress.today}
      current={progress.currentPeriod.entryDate}
      onSelect={select}
    />
  );
}
