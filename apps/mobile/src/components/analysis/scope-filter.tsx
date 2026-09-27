import { ChipFilter } from '@/components/common/chip-filter';
import { slotColor } from '@/components/goals/slot-color';
import type { Goal } from '@/features/goals/types';
import { useTranslations } from '@/lib/i18n';

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
        dot: slotColor(goal.colorSlot),
      }))}
      value={value}
      onChange={onChange}
      allLabel={t('analysis.scope.all')}
    />
  );
}
