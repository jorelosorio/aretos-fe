import { XStack, YStack } from 'tamagui';

import { Chip } from '@/components/common/chip';
import { FormInput } from '@/components/common/form-field';
import { FormSection } from '@/components/common/form-section';
import { slotColor } from '@/components/goals/slot-color';
import { SPACING } from '@/constants/layout';
import { GOAL_NAME_MAX } from '@/features/guide/steps';
import type { GuideDraft } from '@/features/guide/types';
import { useTranslations } from '@/lib/i18n';

import { exampleFor, GUIDE_EXAMPLES } from './guide-examples';
import { StepIntro } from './step-intro';

export function GoalStep({
  draft,
  onChange,
}: {
  draft: GuideDraft;
  onChange: (draft: GuideDraft) => void;
}) {
  const { t } = useTranslations();
  const selected = exampleFor(draft.goalName, t);

  return (
    <YStack gap={SPACING.section}>
      <YStack gap={SPACING.items}>
        <StepIntro title={t('guide.steps.goal')} body={t('guide.goal.body')} />

        <FormInput
          accessibilityLabel={t('guide.goal.namePlaceholder')}
          value={draft.goalName}
          onChangeText={(goalName) => onChange({ ...draft, goalName })}
          placeholder={t('guide.goal.namePlaceholder')}
          maxLength={GOAL_NAME_MAX}
          returnKeyType="done"
        />
      </YStack>

      <FormSection title={t('guide.goal.suggestions')}>
        <XStack gap="$2" flexWrap="wrap">
          {GUIDE_EXAMPLES.map((example) => (
            <Chip
              key={example.name}
              size="regular"
              label={t(example.name)}
              dot={slotColor(example.colorSlot)}
              selected={example === selected}
              onPress={() =>
                onChange({
                  ...draft,
                  goalName: t(example.name),
                  colorSlot: example.colorSlot,
                })
              }
            />
          ))}
        </XStack>
      </FormSection>
    </YStack>
  );
}
