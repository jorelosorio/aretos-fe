import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Check, Maximize2, Plus } from '@tamagui/lucide-icons-2';
import {
  Button,
  Paragraph,
  ScrollView,
  SizableText,
  TextArea,
  XStack,
  YStack,
} from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { ScreenLoader } from '@/components/common/screen-loader';
import { SectionTitle } from '@/components/common/section-title';
import { ICON, SPACING } from '@/constants/layout';
import {
  useGoalCheckIn,
  useGoalErrorMessage,
  type Goal,
  type GoalPeriod,
} from '@/features/goals';
import type { Habit } from '@/features/habits';
import {
  periodKey,
  todayKey,
  useLogDraft,
  useLogErrorMessage,
  weekEnd,
  type DateKey,
} from '@/features/logs';
import { useTranslations } from '@/lib/i18n';

import { EmptyLog } from './empty-log';
import { HabitTrackRow } from './habit-track-row';
import { MoodPicker } from './mood-picker';
import { NoteEditor } from './note-sheet';
import { periodLabel } from './period-label';
import { WeekPicker } from './week-picker';

const NOTE_MAX = 2000;
const NOTE_LINES = 5;
const NOTE_MIN_HEIGHT = 96;
const NOTE_MAX_HEIGHT = 148;

function CheckInForm({
  goal,
  habits,
  periods,
  period,
  periodDate,
  selected,
  today,
  onSelect,
}: {
  goal: Goal;
  habits: Habit[];
  periods: readonly GoalPeriod[];
  period: GoalPeriod | undefined;
  periodDate: DateKey;
  selected: DateKey;
  today: DateKey;
  onSelect: (date: DateKey) => void;
}) {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const toMessage = useLogErrorMessage();

  const [noteOpen, setNoteOpen] = useState(false);

  const draft = useLogDraft({
    goalId: goal.id,
    habits,
    entryDate: periodDate,
    existing: period?.logged ? period : undefined,
    isLoaded: period !== undefined,
  });

  const busy = draft.isLoading || draft.isSaving;

  const save = () =>
    void draft
      .save()
      .then(() => router.back())
      .catch(() => undefined);

  const pick = (next: DateKey) => {
    if (next === selected || draft.isSaving) return;
    if (!draft.isDirty) {
      onSelect(next);
      return;
    }

    void draft
      .save()
      .then(() => onSelect(next))
      .catch(() => undefined);
  };

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
            <WeekPicker
              frequency={goal.trackingFrequency}
              periods={periods}
              selected={selected}
              today={today}
              createdOn={goal.createdAt.slice(0, 10)}
              onSelect={pick}
            />

            <XStack items="center" justify="space-between">
              <SectionTitle>
                {periodLabel(periodDate, goal.trackingFrequency, locale, t)}
              </SectionTitle>

              {period?.logged === true && (
                <XStack items="center" gap="$2">
                  <Check size={ICON.inline} color="$primary" />
                  <SizableText size="$2" color="$mutedForeground">
                    {t('logs.editing')}
                  </SizableText>
                </XStack>
              )}
            </XStack>

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

                <YStack gap={SPACING.group}>
                  <XStack items="center" justify="space-between">
                    <SectionTitle>{t('logs.note')}</SectionTitle>

                    <Button
                      size="$2"
                      circular
                      chromeless
                      onPress={() => setNoteOpen(true)}
                      icon={<Maximize2 size={ICON.row} color="$color" />}
                      accessibilityLabel={t('logs.noteEditor.open')}
                    />
                  </XStack>

                  <TextArea
                    size="$5"
                    value={draft.note}
                    onChangeText={draft.setNote}
                    placeholder={t('logs.notePlaceholder')}
                    placeholderTextColor="$mutedForeground"
                    maxLength={NOTE_MAX}
                    multiline
                    numberOfLines={NOTE_LINES}
                    minH={NOTE_MIN_HEIGHT}
                    maxH={NOTE_MAX_HEIGHT}
                    verticalAlign="top"
                    bg="$card"
                    borderColor="$border"
                  />
                  <Paragraph size="$3" color="$mutedForeground">
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
            {t(period?.logged === true ? 'logs.update' : 'logs.save')}
          </Button>
        </YStack>
      </YStack>

      <NoteEditor
        open={noteOpen}
        value={draft.note}
        maxLength={NOTE_MAX}
        onChange={draft.setNote}
        onCollapse={() => setNoteOpen(false)}
      />
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

  const [selected, setSelected] = useState(opensOn ?? todayKey());

  const from = periodKey(selected, 'weekly');
  const to = weekEnd(selected);
  const { data: goal, isPending, error } = useGoalCheckIn(goalId, from, to);

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

  const periodDate = periodKey(selected, goal.trackingFrequency);
  const periods = progress.periods;

  const single =
    periods.length === 1 &&
    periods[0].entryDate >= from &&
    periods[0].entryDate <= to
      ? periods[0]
      : undefined;

  const period =
    periods.find((entry) => entry.entryDate === periodDate) ?? single;

  return (
    <>
      <Stack.Screen options={{ title: goal.name }} />
      <CheckInForm
        goal={goal}
        habits={habits}
        periods={periods}
        period={period}
        periodDate={periodDate}
        selected={selected}
        today={progress.today}
        onSelect={setSelected}
      />
    </>
  );
}
