import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {
  CalendarDays,
  CalendarRange,
  CircleCheck,
  Gauge,
  Shuffle,
} from '@tamagui/lucide-icons-2';
import {
  Button,
  Input,
  Label,
  ScrollView,
  SizableText,
  Slider,
  TextArea,
  YStack,
} from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { OptionGroup, type Option } from '@/components/common/option-group';
import { SectionTitle } from '@/components/common/section-title';
import {
  useCreateGoal,
  useGoalErrorMessage,
  useUpdateGoal,
  type GoalDraft,
  type StreakRule,
  type TrackingFrequency,
} from '@/features/goals';
import { useTranslations } from '@/lib/i18n';
import { SPACING } from '@/constants/layout';

const NAME_MAX = 120;
const DESCRIPTION_MAX = 1000;

const THRESHOLD_MIN = 5;
const THRESHOLD_MAX = 100;
const THRESHOLD_STEP = 5;

export function GoalForm({
  goalId,
  initial,
}: {
  goalId?: string;
  initial: GoalDraft;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const toMessage = useGoalErrorMessage();

  const { createGoal, isCreating, error: createError } = useCreateGoal();
  const { updateGoal, isUpdating, error: updateError } = useUpdateGoal();

  const [draft, setDraft] = useState(initial);

  const patch = (change: Partial<GoalDraft>) =>
    setDraft((current) => ({ ...current, ...change }));

  const busy = isCreating || isUpdating;
  const name = draft.name.trim();

  const frequencies: readonly Option<TrackingFrequency>[] = [
    {
      value: 'daily',
      label: t('goals.frequency.daily'),
      hint: t('goals.frequency.dailyHint'),
      Icon: CalendarDays,
    },
    {
      value: 'weekly',
      label: t('goals.frequency.weekly'),
      hint: t('goals.frequency.weeklyHint'),
      Icon: CalendarRange,
    },
    {
      value: 'flexible',
      label: t('goals.frequency.flexible'),
      hint: t('goals.frequency.flexibleHint'),
      Icon: Shuffle,
    },
  ];

  const streakRules: readonly Option<StreakRule>[] = [
    {
      value: 'logged',
      label: t('goals.streak.logged'),
      hint: t('goals.streak.loggedHint'),
      Icon: CircleCheck,
    },
    {
      value: 'threshold',
      label: t('goals.streak.threshold'),
      hint: t('goals.streak.thresholdHint'),
      Icon: Gauge,
    },
  ];

  async function save() {
    if (!name) return;

    const value: GoalDraft = { ...draft, name };

    await (
      goalId ? updateGoal({ id: goalId, patch: value }) : createGoal(value)
    )
      .then(() => router.back())
      .catch(() => undefined);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        flex={1}
        bg="$background"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ grow: 1 }}
      >
        <YStack flex={1} p={SPACING.screen} gap={SPACING.section}>
          <ErrorNotice message={toMessage(createError ?? updateError)} />

          <YStack gap={SPACING.group}>
            <Label htmlFor="goal-name" color="$color">
              {t('goals.form.name')}
            </Label>
            <Input
              id="goal-name"
              value={draft.name}
              onChangeText={(value) => patch({ name: value })}
              placeholder={t('goals.form.namePlaceholder')}
              placeholderTextColor="$mutedForeground"
              maxLength={NAME_MAX}
              autoFocus={!goalId}
              bg="$card"
              borderColor="$border"
            />
          </YStack>

          <YStack gap={SPACING.group}>
            <Label htmlFor="goal-description" color="$color">
              {t('goals.form.description')}
            </Label>
            <TextArea
              id="goal-description"
              value={draft.description}
              onChangeText={(value) => patch({ description: value })}
              placeholder={t('goals.form.descriptionPlaceholder')}
              placeholderTextColor="$mutedForeground"
              maxLength={DESCRIPTION_MAX}
              numberOfLines={3}
              bg="$card"
              borderColor="$border"
            />
          </YStack>

          <OptionGroup
            title={t('goals.form.frequency')}
            options={frequencies}
            value={draft.trackingFrequency}
            onChange={(value) => patch({ trackingFrequency: value })}
          />

          <YStack gap={SPACING.items}>
            <OptionGroup
              title={t('goals.form.streakRule')}
              options={streakRules}
              value={draft.streakRule}
              onChange={(value) => patch({ streakRule: value })}
            />

            {draft.streakRule === 'threshold' && (
              <YStack gap={SPACING.group}>
                <SectionTitle>{t('goals.form.threshold')}</SectionTitle>

                <YStack
                  gap={SPACING.items}
                  p={SPACING.card}
                  bg="$card"
                  rounded="$xl2"
                  borderWidth={1}
                  borderColor="$border"
                >
                  <SizableText
                    size="$8"
                    fontFamily="$heading"
                    color="$primary"
                    text="center"
                  >
                    {`${draft.streakThreshold}%`}
                  </SizableText>

                  <Slider
                    min={THRESHOLD_MIN}
                    max={THRESHOLD_MAX}
                    step={THRESHOLD_STEP}
                    value={[draft.streakThreshold]}
                    onValueChange={([value]) =>
                      patch({ streakThreshold: value })
                    }
                    accessibilityLabel={t('goals.form.threshold')}
                  >
                    <Slider.Track bg="$muted" size="$1">
                      <Slider.TrackActive bg="$primary" />
                    </Slider.Track>
                    <Slider.Thumb
                      index={0}
                      circular
                      size="$2"
                      bg="$primary"
                      borderColor="$background"
                    />
                  </Slider>
                </YStack>
              </YStack>
            )}
          </YStack>

          <Button
            size="$5"
            theme="accent"
            onPress={save}
            disabled={!name || busy}
            opacity={!name || busy ? 0.7 : 1}
          >
            {goalId ? t('goals.form.save') : t('goals.form.create')}
          </Button>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
