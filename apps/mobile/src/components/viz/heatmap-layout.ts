/**
 * Where each heatmap cell sits, and the SVG paths that draw them.
 *
 * A year is 53 weeks of 7 days, and the analysis screen draws one calendar per
 * goal on top of the overall one. As a styled view per cell that came to
 * thousands of views mounted in a single render, which is what froze the
 * screen on the 1-year window. Drawing every cell of one colour as a single
 * path keeps the native tree at a handful of nodes however long the window
 * is, and finding the pressed cell becomes arithmetic on the touch point
 * rather than a handler per square.
 */

import type { HeatCell } from '@/features/analysis';
import { weekdayIndex } from '@/features/logs';

export const WEEK_ROWS = 7;

export type PlacedCell = { cell: HeatCell; column: number; row: number };

export type HeatmapLayout = {
  columns: number;
  cells: readonly PlacedCell[];
  /** Keyed by `column * WEEK_ROWS + row`, for turning a touch into a cell. */
  bySlot: ReadonlyMap<number, HeatCell>;
};

/**
 * One column per week, Monday on top. A week starts a new column only once a
 * cell has been placed, so a window opening mid-week begins with a partial
 * column instead of an empty one.
 */
export function placeCells(cells: readonly HeatCell[]): HeatmapLayout {
  const placed: PlacedCell[] = [];
  const bySlot = new Map<number, HeatCell>();
  let column = 0;

  for (const cell of cells) {
    const row = weekdayIndex(cell.date);
    if (placed.length > 0 && row === 0) column += 1;

    placed.push({ cell, column, row });
    bySlot.set(column * WEEK_ROWS + row, cell);
  }

  return {
    columns: placed.length === 0 ? 0 : column + 1,
    cells: placed,
    bySlot,
  };
}

/** The rounded squares at these slots, as one path's `d`. */
export function squaresPath(
  squares: readonly Pick<PlacedCell, 'column' | 'row'>[],
  size: number,
  gap: number,
  radius: number,
): string {
  const step = size + gap;
  const r = Math.min(radius, size / 2);
  const side = size - 2 * r;

  return squares
    .map(({ column, row }) => {
      const x = column * step;
      const y = row * step;

      return (
        `M${x + r},${y}h${side}a${r},${r} 0 0 1 ${r},${r}v${side}` +
        `a${r},${r} 0 0 1 ${-r},${r}h${-side}a${r},${r} 0 0 1 ${-r},${-r}` +
        `v${-side}a${r},${r} 0 0 1 ${r},${-r}z`
      );
    })
    .join('');
}

/**
 * The cell under a touch, or `null` for a slot with no cell. A touch in the
 * gap after a square counts as that square, which is the slack the per-cell
 * `hitSlop` used to give.
 */
export function cellAt(
  layout: HeatmapLayout,
  x: number,
  y: number,
  step: number,
): HeatCell | null {
  const column = Math.floor(x / step);
  const row = Math.floor(y / step);
  if (column < 0 || row < 0 || row >= WEEK_ROWS) return null;

  return layout.bySlot.get(column * WEEK_ROWS + row) ?? null;
}
