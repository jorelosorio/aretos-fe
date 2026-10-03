import { memo } from 'react';
import { CircleCheck } from '@tamagui/lucide-icons-2/icons/CircleCheck';
import { Languages } from '@tamagui/lucide-icons-2/icons/Languages';

import type { ChipBadge } from '@/components/common/chip';
import { GoalCell } from '@/components/goals/goal-cell';
import type { Template } from '@/features/templates/types';
import { useTranslations } from '@/lib/i18n';

import {
  LANGUAGE_NAMES,
  STATUS_ICONS,
  STATUS_LABELS,
  templateStatus,
} from './template-labels';

export const TemplateCard = memo(function TemplateCard({
  template,
  inUse,
  onOpen,
}: {
  template: Template;
  inUse: boolean;
  onOpen: (template: Template) => void;
}) {
  const { t } = useTranslations();
  const status = templateStatus(template);

  const habits = t(
    template.habits.length === 1 ? 'habits.countOne' : 'habits.countMany',
    { count: template.habits.length },
  );

  const badges: ChipBadge[] = [
    { label: LANGUAGE_NAMES[template.language], Icon: Languages },
    ...(inUse
      ? [{ label: t('templates.inUse'), Icon: CircleCheck, highlighted: true }]
      : []),
    ...(status === null
      ? []
      : [{ label: t(STATUS_LABELS[status]), Icon: STATUS_ICONS[status] }]),
  ];

  return (
    <GoalCell
      name={template.name}
      author={template.publisher}
      description={template.description}
      badges={badges}
      habitCount={template.habits.length}
      trackingFrequency={template.trackingFrequency}
      onPress={() => onOpen(template)}
      accessibilityLabel={[
        template.name,
        template.publisher.name,
        habits,
        ...badges.map((badge) => badge.label),
      ].join('. ')}
    />
  );
});
