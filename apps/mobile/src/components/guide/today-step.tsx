import { SizableText, XStack, YStack } from 'tamagui';

import { Card } from '@/components/common/card';
import { OutcomeMark } from '@/components/logs/outcome-mark';
import { SPACING, TEXT } from '@/constants/layout';
import { chosenHabits, toggleDone } from '@/features/guide/steps';
import type { GuideDraft } from '@/features/guide/types';
import { useTranslations } from '@/lib/i18n';

import { StepIntro } from './step-intro';

export function TodayStep({
  draft,
  onChange,
}: {
  draft: GuideDraft;
  onChange: (draft: GuideDraft) => void;
}) {
  const { t } = useTranslations();

  return (
    <YStack gap={SPACING.section}>
      <StepIntro title={t('guide.steps.today')} body={t('guide.today.body')} />

      <YStack gap={SPACING.items}>
        {chosenHabits(draft).map((habit) => {
          const done = draft.doneToday.includes(habit);
          const state = t(done ? 'guide.today.done' : 'guide.today.pending');

          return (
            <Card
              key={habit}
              row
              pressable
              density="tight"
              items="center"
              onPress={() => onChange(toggleDone(draft, habit))}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              accessibilityLabel={`${habit}. ${state}`}
            >
              <OutcomeMark outcome={done ? 'done' : 'pending'} label={state} />
              <XStack flex={1}>
                <SizableText
                  size={TEXT.subheading}
                  fontWeight="700"
                  color="$cardForeground"
                >
                  {habit}
                </SizableText>
              </XStack>
            </Card>
          );
        })}
      </YStack>
    </YStack>
  );
}
