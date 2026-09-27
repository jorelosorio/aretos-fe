import { SizableText, XStack } from 'tamagui';

import { ICON, TEXT } from '@/constants/layout';
import type { PeriodStatus } from '@/features/goals/types';
import { useTranslations } from '@/lib/i18n';

import {
  PERIOD_STATUS_COLORS,
  PERIOD_STATUS_GLYPHS,
  PERIOD_STATUS_LABELS,
} from './period-status';

export function CompletionStatus({
  status,
  answered,
  total,
  detail,
}: {
  status: PeriodStatus;
  answered: number;
  total: number;
  detail?: string;
}) {
  const { t } = useTranslations();

  const Glyph = PERIOD_STATUS_GLYPHS[status];
  const color =
    status === 'empty' ? '$mutedForeground' : PERIOD_STATUS_COLORS[status];

  return (
    <XStack items="center" gap="$1.5" minW={0}>
      <Glyph size={ICON.inline} color={color} strokeWidth={2.5} />

      <SizableText size={TEXT.caption} color={color} numberOfLines={1}>
        {t(PERIOD_STATUS_LABELS[status])}
      </SizableText>

      <SizableText
        shrink={1}
        size={TEXT.caption}
        fontWeight="600"
        color="$mutedForeground"
        numberOfLines={1}
      >
        {detail ?? t('goals.progress', { answered, total })}
      </SizableText>
    </XStack>
  );
}
