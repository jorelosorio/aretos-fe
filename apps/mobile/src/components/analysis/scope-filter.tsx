import { YStack } from 'tamagui';

import { ChipFilter } from '@/components/common/chip-filter';
import type { ChipLeading } from '@/components/common/chip';
import { slotColor } from '@/components/goals/slot-color';
import type { Goal } from '@/features/goals';
import { useTranslations } from '@/lib/i18n';

const DOT = 8;

function goalMark(slot: number): ChipLeading {
  return function GoalMark(active) {
    return (
      <YStack
        width={DOT}
        height={DOT}
        rounded={DOT / 2}
        bg={active ? '$primaryForeground' : slotColor(slot)}
      />
    );
  };
}

export function ScopeFilter({
  goals,
  value,
  onChange,
}: {
  goals: readonly Goal[];
  value: string | null;
  onChange: (goalId: string | null) => void;
}) {
  const { t } = useTranslations();

  return (
    <ChipFilter
      items={goals.map((goal) => ({
        key: goal.id,
        label: goal.name,
        leading: goalMark(goal.colorSlot),
      }))}
      value={value}
      onChange={onChange}
      allLabel={t('analysis.scope.all')}
    />
  );
}
