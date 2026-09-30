import { YStack } from 'tamagui';

import { HabitTrackList } from '@/components/logs/habit-track-list';
import { SPACING } from '@/constants/layout';
import {
  chosenHabits,
  draftHabit,
  entryFor,
  setEntry,
  todayRequirements,
  toggleSkip,
} from '@/features/guide/steps';
import type { GuideDraft } from '@/features/guide/types';
import { useTranslations } from '@/lib/i18n';

import { Requirement, Requirements } from './requirement';
import { StepIntro } from './step-intro';

export function TodayStep({
  draft,
  onChange,
}: {
  draft: GuideDraft;
  onChange: (draft: GuideDraft) => void;
}) {
  const { t } = useTranslations();
  const { done, skipped } = todayRequirements(draft);

  return (
    <YStack gap={SPACING.section}>
      <StepIntro title={t('guide.steps.today')} body={t('guide.today.body')} />

      <HabitTrackList
        habits={chosenHabits(draft).map(draftHabit)}
        entryFor={(name) => entryFor(draft, name)}
        onChange={(name, patch) => onChange(setEntry(draft, name, patch))}
        onToggleSkip={(name) => onChange(toggleSkip(draft, name))}
      />

      <Requirements>
        <Requirement label={t('guide.today.needDone')} met={done} />
        {skipped !== null && (
          <Requirement label={t('guide.today.needSkip')} met={skipped} />
        )}
      </Requirements>
    </YStack>
  );
}
