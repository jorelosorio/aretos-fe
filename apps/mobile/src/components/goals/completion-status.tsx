/**
 * The glyph, status word and count that say how much of a period is done.
 *
 * Home and diary each show a goal's card with the same three facts — a
 * status, then how many of its habits are answered — and until this existed
 * each screen drew its own row, which is how they drifted into different
 * spacing from their neighbours. One component now, so the two cards read as
 * the same idea and can't drift again.
 *
 * On home it is the card's whole second line, with `detail` carrying the
 * count and the cadence as one phrase: "Complete 2 of 3 habits · Daily". It
 * used to sit on a row of its own, under a "3 habits · Daily" line and over a
 * progress bar that drew the same "2 of 3" twice more, and the three cost
 * lines of every card on a screen whose point is how many cards fit.
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
