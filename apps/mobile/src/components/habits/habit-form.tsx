import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { CircleCheck, Clock, Hash, Star } from '@tamagui/lucide-icons-2';
import {
  Button,
  Input,
  Label,
  ScrollView,
  SizableText,
  TextArea,
  YStack,
} from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { OptionGroup, type Option } from '@/components/common/option-group';
import { SectionTitle } from '@/components/common/section-title';
import {
  SegmentedControl,
  type Segment,
} from '@/components/common/segmented-control';
import { BUTTON, SPACING, TEXT } from '@/constants/layout';
import { DEFAULT_TARGET, HabitTarget } from './habit-target';
import {
  hasThreshold,
  useCreateHabit,
  useHabitErrorMessage,
  useUpdateHabit,
  type HabitDraft,
  type TrackingMode,
} from '@/features/habits';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

const NAME_MAX = 200;
const PLAN_MAX = 500;
const WEIGHTS = ['1', '2', '3'] as const;

const WEIGHT_LABELS: Record<(typeof WEIGHTS)[number], TranslationKey> = {
  '1': 'habits.weight.normal',
  '2': 'habits.weight.double',
  '3': 'habits.weight.triple',
};

export function HabitForm({
  goalId,
  habitId,
  initial,
}: {
  goalId: string;
  habitId?: string;
  initial: HabitDraft;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const toMessage = useHabitErrorMessage();

  const {
    createHabit,
    isCreating,
    error: createError,
  } = useCreateHabit(goalId);
  const { updateHabit, isUpdating, error: updateError } = useUpdateHabit();

  const [draft, setDraft] = useState(initial);

  const patch = (change: Partial<HabitDraft>) =>
    setDraft((current) => ({ ...current, ...change }));

  const selectMode = (mode: TrackingMode) =>
    patch({
      trackingMode: mode,
      successThreshold: hasThreshold(mode) ? DEFAULT_TARGET[mode] : null,
    });

  const busy = isCreating || isUpdating;
  const name = draft.name.trim();

  const modes: readonly Option<TrackingMode>[] = [
    {
      value: 'binary',
      label: t('habits.mode.binary'),
      hint: t('habits.mode.binaryHint'),
      Icon: CircleCheck,
    },
    {
      value: 'count',
      label: t('habits.mode.count'),
      hint: t('habits.mode.countHint'),
      Icon: Hash,
    },
    {
      value: 'duration',
      label: t('habits.mode.duration'),
      hint: t('habits.mode.durationHint'),
      Icon: Clock,
    },
    {
      value: 'rating',
      label: t('habits.mode.rating'),
      hint: t('habits.mode.ratingHint'),
      Icon: Star,
    },
  ];

  const weights: readonly Segment<(typeof WEIGHTS)[number]>[] = WEIGHTS.map(
    (weight) => ({ value: weight, label: t(WEIGHT_LABELS[weight]) }),
  );

  async function save() {
    if (!name) return;

    const value: HabitDraft = { ...draft, name };

    await (
      habitId ? updateHabit({ id: habitId, patch: value }) : createHabit(value)
    )
      .then(() => router.back())
      .catch(() => undefined);
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
          <YStack flex={1} p={SPACING.screen} gap={SPACING.section}>
            <ErrorNotice message={toMessage(createError ?? updateError)} />

            <YStack gap={SPACING.group}>
              <Label htmlFor="habit-name" color="$color">
                {t('habits.form.name')}
              </Label>
              <Input
                id="habit-name"
                size="$5"
                value={draft.name}
                onChangeText={(value) => patch({ name: value })}
                placeholder={t('habits.form.namePlaceholder')}
                placeholderTextColor="$mutedForeground"
                maxLength={NAME_MAX}
                autoFocus={!habitId}
                bg="$card"
                borderColor="$border"
              />
              <SizableText size={TEXT.caption} color="$mutedForeground" px="$2">
                {t('habits.form.nameHint')}
              </SizableText>
            </YStack>

            <OptionGroup
              title={t('habits.form.mode')}
              options={modes}
              value={draft.trackingMode}
              onChange={selectMode}
            />

            <HabitTarget
              mode={draft.trackingMode}
              value={
                draft.successThreshold ??
                DEFAULT_TARGET[draft.trackingMode] ??
                1
              }
              onChange={(value) => patch({ successThreshold: value })}
            />

            <YStack gap={SPACING.group}>
              <SectionTitle>{t('habits.form.weight')}</SectionTitle>
              <SegmentedControl
                segments={weights}
                value={String(draft.weight) as (typeof WEIGHTS)[number]}
                onChange={(value) => patch({ weight: Number(value) })}
              />
              <SizableText size={TEXT.caption} color="$mutedForeground" px="$2">
                {t('habits.form.weightHint')}
              </SizableText>
            </YStack>

            <YStack gap={SPACING.group}>
              <Label htmlFor="habit-plan" color="$color">
                {t('habits.form.plan')}
              </Label>
              <TextArea
                id="habit-plan"
                size="$5"
                value={draft.ifThenPlan}
                onChangeText={(value) => patch({ ifThenPlan: value })}
                placeholder={t('habits.form.planPlaceholder')}
                placeholderTextColor="$mutedForeground"
                maxLength={PLAN_MAX}
                multiline
                numberOfLines={4}
                minH={112}
                verticalAlign="top"
                bg="$card"
                borderColor="$border"
              />
              <SizableText size={TEXT.caption} color="$mutedForeground" px="$2">
                {t('habits.form.planHint')}
              </SizableText>
            </YStack>
          </YStack>
        </ScrollView>

        <YStack
          p={SPACING.screen}
          bg="$card"
          borderTopWidth={1}
          borderTopColor="$border"
        >
          <Button
            size={BUTTON.primary}
            theme="accent"
            onPress={save}
            disabled={!name || busy}
            opacity={!name || busy ? 0.7 : 1}
          >
            {habitId ? t('habits.form.save') : t('habits.form.create')}
          </Button>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}
