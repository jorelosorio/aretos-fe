import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
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
import type { Goal } from '@/features/goals';
import { useHabits, type Habit } from '@/features/habits';
import {
  isFuturePeriod,
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

function CheckInForm({ goal, habits }: { goal: Goal; habits: Habit[] }) {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const toMessage = useLogErrorMessage();

  const [date, setDate] = useState(todayKey());
  const draft = useLogDraft({ goal, habits, date });

  const frequency = goal.trackingFrequency;
  const canGoForward = !isFuturePeriod(
    shiftPeriod(draft.entryDate, frequency, 1),
    frequency,
  );

  const busy = draft.isLoading || draft.isSaving;

  const save = () =>
    void draft
      .save()
      .then(() => router.back())
      .catch(() => undefined);

  if (draft.loadError) {
    return (
      <YStack flex={1} p={SPACING.screen}>
        <ErrorNotice message={toMessage(draft.loadError)} />
      </YStack>
    );
  }

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
              label={periodLabel(draft.entryDate, frequency, locale, t)}
              canGoForward={canGoForward}
              onPrevious={() =>
                setDate(shiftPeriod(draft.entryDate, frequency, -1))
              }
              onNext={() => setDate(shiftPeriod(draft.entryDate, frequency, 1))}
            />

            {draft.existing && (
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
            {t(draft.existing ? 'logs.update' : 'logs.save')}
          </Button>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}

export function CheckInScreen({ goal }: { goal: Goal }) {
  const { t } = useTranslations();
  const router = useRouter();
  const { data: habits, isPending } = useHabits(goal.id);

  if (isPending || !habits) return <ScreenLoader />;

  if (habits.length === 0) {
    return (
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
    );
  }

  return <CheckInForm goal={goal} habits={habits} />;
}
