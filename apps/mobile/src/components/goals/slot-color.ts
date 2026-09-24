/**
 * The goal palette, indexed by a goal's `color_slot`.
 *
 * The user picks the slot and the server stores only the index; the hue each
 * slot is lives here, as a theme token, so light and dark can each give it a
 * value that holds contrast. The server bounds `color_slot` to 0–7
 * (`goals_color_slot_check`), so this list and that check have to change
 * together.
 *
 * A slot with no entry falls back to muted ink rather than cycling, because a
 * made-up colour would read as a pick the user never made.
 */

import type { TranslationKey } from '@/lib/i18n';

export const GOAL_COLORS = [
  { token: '$chart1', name: 'goals.colors.terracotta' },
  { token: '$chart2', name: 'goals.colors.teal' },
  { token: '$chart3', name: 'goals.colors.ochre' },
  { token: '$chart4', name: 'goals.colors.rose' },
  { token: '$chart5', name: 'goals.colors.purple' },
  { token: '$chart6', name: 'goals.colors.brown' },
  { token: '$chart7', name: 'goals.colors.blue' },
  { token: '$chart8', name: 'goals.colors.moss' },
] as const satisfies readonly { token: string; name: TranslationKey }[];

/** Inferred, not annotated as `string`: Tamagui only accepts its own tokens. */
export const slotColor = (slot: number) =>
  GOAL_COLORS[slot]?.token ?? '$mutedForeground';
