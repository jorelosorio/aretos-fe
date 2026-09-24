/**
 * The glyph, status word and count that say how much of a period is done.
 *
 * Home and diary each show a goal's card with the same three facts below its
 * header — a status, then how many of its habits are answered — and until
 * this existed each screen drew its own row, which is how they drifted into
 * different spacing from their neighbours. One component now, so the two
 * cards read as the same idea and can't drift again.
 */

import { SizableText, XStack } from 'tamagui';

import { ICON, TEXT } from '@/constants/layout';
import type { PeriodStatus } from '@/features/goals';
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
}: {
  status: PeriodStatus;
  answered: number;
  total: number;
}) {
  const { t } = useTranslations();

  const Glyph = PERIOD_STATUS_GLYPHS[status];
  const color =
    status === 'empty' ? '$mutedForeground' : PERIOD_STATUS_COLORS[status];

  return (
    <XStack items="center" gap="$1.5">
      <Glyph size={ICON.inline} color={color} strokeWidth={2.5} />

      <SizableText size={TEXT.caption} color={color} numberOfLines={1}>
        {t(PERIOD_STATUS_LABELS[status])}
      </SizableText>

      <SizableText
        size={TEXT.caption}
        fontWeight="600"
        color="$mutedForeground"
      >
        {t('goals.progress', { answered, total })}
      </SizableText>
    </XStack>
  );
}
