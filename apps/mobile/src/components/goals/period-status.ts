/**
 * How a period's status reads on screen: its colour and its word.
 *
 * The server decides the status (`internal/progress`); this is only how the
 * app says it out loud. It lives here rather than in any one screen because
 * three now show it — the home card, for the period waiting to be reported,
 * the check-in's week strip, for every day of the week, and the diary, for
 * the period an entry was written about — and a status that is amber in one
 * place and grey in the other is a bug nobody files.
 *
 * The wording is the forgiving half of the product brief, not a scoreboard:
 * `partial` is "on the way" rather than "partly done", because a period with
 * some of it done is progress and not a shortfall, and `missed` is "not this
 * time" because the streak survives it. `skipped` says "didn't apply", the
 * brief's own words for the case that leaves the maths alone entirely.
 *
 * The shape follows `OUTCOME_COLORS` in `features/logs`, which does the same
 * job one level down, for a single habit's answer rather than a period.
 * `satisfies` rather than an annotation, because Tamagui only accepts its own
 * token literals and annotating these widens them to `string`.
 */

import {
  Check,
  CircleDashed,
  CircleDot,
  Minus,
  X,
} from '@tamagui/lucide-icons-2';

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

/**
 * The mark that stands in for each status where there is no room to say it.
 *
 * The week strip is the one that needs them: seven periods across a phone's
 * width leaves room for a glyph and nothing else. Home and the diary draw the
 * glyph beside the word rather than instead of it.
 */
export const PERIOD_STATUS_GLYPHS = {
  complete: Check,
  partial: CircleDot,
  missed: X,
  skipped: Minus,
  empty: CircleDashed,
} as const satisfies Record<PeriodStatus, unknown>;

/** The same five, worded for a badge rather than for a colour. */
export const PERIOD_STATUS_LABELS = {
  complete: 'logs.status.complete',
  partial: 'logs.status.partial',
  missed: 'logs.status.missed',
  skipped: 'logs.status.skipped',
  empty: 'logs.status.empty',
} as const satisfies Record<PeriodStatus, TranslationKey>;
