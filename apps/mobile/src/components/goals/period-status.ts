/**
 * How a period's status reads on screen: its colour and its word.
 *
 * The server decides the status (`internal/progress`); this is only how the
 * app says it out loud. It lives here rather than in either screen because
 * two now show it — the home card, for the period waiting to be reported,
 * and the check-in's week strip, for every day of the week — and a status
 * that is amber in one place and grey in the other is a bug nobody files.
 *
 * The shape follows `OUTCOME_COLORS` in `features/logs`, which does the same
 * job one level down, for a single habit's answer rather than a period.
 * `satisfies` rather than an annotation, because Tamagui only accepts its own
 * token literals and annotating these widens them to `string`.
 */

import type { PeriodStatus } from '@/features/goals';
import type { TranslationKey } from '@/lib/i18n';

/** `empty` is transparent: a period nobody has reached yet marks nothing. */
export const PERIOD_STATUS_COLORS = {
  complete: '$outcomeDone',
  partial: '$primary',
  missed: '$outcomeMissed',
  skipped: '$outcomeSkipped',
  empty: 'transparent',
} as const satisfies Record<PeriodStatus, string>;

/** The same five, worded for a badge rather than for a colour. */
export const PERIOD_STATUS_LABELS = {
  complete: 'logs.status.complete',
  partial: 'logs.status.partial',
  missed: 'logs.status.missed',
  skipped: 'logs.status.skipped',
  empty: 'logs.status.empty',
} as const satisfies Record<PeriodStatus, TranslationKey>;
