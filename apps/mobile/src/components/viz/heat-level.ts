/**
 * Which colour one heatmap cell is drawn in.
 *
 * Three states have to stay apart, and conflating any two of them is the
 * mistake this block exists to prevent.
 *
 * `level: null` means nothing was due that day — the cell is outside the
 * tracked calendar rather than empty within it. A weekly goal has one period a
 * week, and a calendar that painted its other six days as misses would show it
 * as six failures a week. Those cells are drawn as nothing at all, which is
 * why this returns `null` rather than a token.
 *
 * `level: 0` with `skipped > 0` is a day passed on purpose. It has no rate to
 * colour by and is not a day anything was failed at, so it takes the theme's
 * own "not applicable" grey — the same one `week-strip.tsx` uses. The backend
 * doc suggests a yellow here, after Way of Life, but this app already has a
 * colour that means exactly this and internal consistency wins.
 *
 * `level: 0` otherwise is a day that was due and came to nothing, whether it
 * went unlogged or was logged and achieved none of itself.
 *
 * Levels 1-4 run up the theme's sequential ramp. `seq1` is deliberately
 * skipped: against `vizEmpty` it is nearly indistinguishable in both themes
 * (`#f7dcc4` vs `#f0e8db` in light, `#4a2a18` vs `#281f18` in dark), so
 * starting at `seq2` is what keeps level 0 and level 1 apart — the separation
 * that matters most, at the bottom of the scale where the differences are
 * smallest.
 */

import type { ColorTokens } from 'tamagui';

import type { HeatCell } from '@/features/analysis';

/** Levels 1..4, in order. Index 0 is level 1. */
const RAMP = ['$seq2', '$seq3', '$seq4', '$seq5'] as const;

export const HEAT_EMPTY = '$vizEmpty';
export const HEAT_SKIPPED = '$outcomeSkipped';

/** The token for a cell, or `null` when nothing was due and nothing is drawn. */
export function heatToken(cell: HeatCell): ColorTokens | null {
  if (cell.level === null) return null;
  if (cell.level === 0) return cell.skipped > 0 ? HEAT_SKIPPED : HEAT_EMPTY;

  return RAMP[Math.min(cell.level, RAMP.length) - 1];
}

/** The legend's swatches, palest first, for a scale built from the response. */
export const HEAT_LEGEND = [HEAT_EMPTY, ...RAMP] as const;
