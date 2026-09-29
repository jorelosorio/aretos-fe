import { SizableText, XStack, YStack } from 'tamagui';

import { Card } from '@/components/common/card';
import { OutcomeRail } from '@/components/logs/outcome-rail';
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
  const habits = chosenHabits(draft);

  return (
    <YStack gap={SPACING.section}>
      <StepIntro title={t('guide.steps.today')} body={t('guide.today.body')} />

      <YStack>
        {habits.map((habit, index) => {
          const done = draft.doneToday.includes(habit);
          const state = t(done ? 'guide.today.done' : 'guide.today.pending');
          const toggle = () => onChange(toggleDone(draft, habit));
          const isLast = index === habits.length - 1;

          return (
            <XStack key={habit} gap="$2">
              <OutcomeRail
                outcome={done ? 'done' : 'pending'}
                label={`${habit}. ${state}`}
                isFirst={index === 0}
                isLast={isLast}
                onPress={toggle}
              />

              <Card
                flex={1}
                pressable
                density="tight"
                mb={isLast ? 0 : SPACING.items}
                onPress={toggle}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
                accessibilityLabel={`${habit}. ${state}`}
              >
                <SizableText
                  size={TEXT.subheading}
                  fontWeight="700"
                  color="$cardForeground"
                  numberOfLines={2}
                >
                  {habit}
                </SizableText>
              </Card>
            </XStack>
          );
        })}
      </YStack>
    </YStack>
  );
}
