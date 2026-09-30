import { useState } from 'react';
import { Plus } from '@tamagui/lucide-icons-2/icons/Plus';
import { X } from '@tamagui/lucide-icons-2/icons/X';
import { XStack, YStack } from 'tamagui';

import { Chip } from '@/components/common/chip';
import { EmptySlot } from '@/components/common/empty-slot';
import { FormInput } from '@/components/common/form-field';
import { FormHint, FormSection } from '@/components/common/form-section';
import { HeaderIconButton } from '@/components/common/header-actions';
import { SPACING } from '@/constants/layout';
import {
  clearSlot,
  editSlot,
  fillSlot,
  HABIT_NAME_MAX,
  habitsFilled,
  hasFreeSlot,
  missingSuggestions,
} from '@/features/guide/steps';
import type { GuideDraft } from '@/features/guide/types';
import { useTranslations } from '@/lib/i18n';

import { Requirement, Requirements } from './requirement';
import { StepIntro } from './step-intro';

const REMOVE_SPACE = 52;

export function HabitsStep({
  draft,
  suggestions,
  onChange,
}: {
  draft: GuideDraft;
  suggestions: readonly string[];
  onChange: (draft: GuideDraft) => void;
}) {
  const { t } = useTranslations();
  const [editing, setEditing] = useState<number | null>(null);

  const free = hasFreeSlot(draft);
  const missing = missingSuggestions(draft, suggestions);
  const { filled, total } = habitsFilled(draft);

  const settle = (index: number) => {
    if (draft.slots[index]?.trim() === '') onChange(clearSlot(draft, index));
    setEditing(null);
  };

  return (
    <YStack gap={SPACING.section}>
      <StepIntro
        title={t('guide.steps.habits')}
        body={t('guide.habits.body')}
      />

      <YStack gap={SPACING.items}>
        {draft.slots.map((slot, index) =>
          slot === '' && editing !== index ? (
            <EmptySlot
              key={index}
              Icon={Plus}
              label={t('guide.habits.addLabel')}
              onPress={() => setEditing(index)}
            />
          ) : (
            <YStack key={index} justify="center">
              <FormInput
                pr={REMOVE_SPACE}
                accessibilityLabel={t('guide.habits.namePlaceholder')}
                value={slot}
                onChangeText={(value) =>
                  onChange(editSlot(draft, index, value))
                }
                placeholder={t('guide.habits.namePlaceholder')}
                maxLength={HABIT_NAME_MAX}
                autoFocus={editing === index && slot === ''}
                returnKeyType="done"
                submitBehavior="blurAndSubmit"
                onBlur={() => settle(index)}
              />
              <XStack position="absolute" t={0} b={0} r="$2" items="center">
                <HeaderIconButton
                  Icon={X}
                  label={t('guide.habits.remove', {
                    name: slot.trim() || t('guide.habits.namePlaceholder'),
                  })}
                  onPress={() => {
                    onChange(clearSlot(draft, index));
                    setEditing(null);
                  }}
                />
              </XStack>
            </YStack>
          ),
        )}
      </YStack>

      {free && missing.length > 0 && (
        <FormSection title={t('guide.habits.suggestions')}>
          <XStack gap="$2" flexWrap="wrap">
            {missing.map((suggestion) => (
              <Chip
                key={suggestion}
                size="regular"
                raised
                label={suggestion}
                Icon={Plus}
                accessibilityLabel={t('guide.habits.suggestionLabel', {
                  name: suggestion,
                })}
                onPress={() => onChange(fillSlot(draft, suggestion))}
              />
            ))}
          </XStack>
        </FormSection>
      )}

      <Requirements>
        <Requirement
          label={t('guide.habits.need', { filled, total })}
          met={total > 0 && filled === total}
        />
      </Requirements>

      {!free && <FormHint>{t('guide.habits.full')}</FormHint>}
    </YStack>
  );
}
