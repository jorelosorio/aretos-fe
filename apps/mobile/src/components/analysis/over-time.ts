/**
 * The report's daily calendar folded into a series worth drawing as a line.
 *
 * The heatmap is the only series the analysis response carries — one cell per
 * day, with that day's completion and mood — and the trend and mood cards
 * each summarise it into a single number. Drawn day by day it is too jagged
 * to read (a weekday rhythm alone swings it every few points), so this
 * averages it into weeks, or into months once a year of weeks would crowd a
 * phone's width.
 *
 * It averages what the server measured and nothing else. A day whose rate is
 * `null` had nothing measurable and is left out of the mean rather than
 * counted as zero; a bucket with no measured day at all is dropped from the
 * line rather than drawn at the bottom of it — the report's "null is not
 * zero" rule, one level up.
 */

import type { HeatCell } from '@/features/analysis';
import { periodKey } from '@/features/logs';
import type { AppLocale } from '@/lib/i18n';

import { shortDateLabel } from '@/components/common/date-label';
import type { LinePoint } from '@/components/viz/line-chart';

/** Past this many weeks the line switches to months. */
const MAX_WEEKS = 20;

type Pick = (cell: HeatCell) => number | null;

function monthLabel(key: string, locale: AppLocale): string {
  const [year, month] = key.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, { month: 'short' }).format(
    new Date(year, month - 1, 1),
  );
}

export function overTime(
  cells: readonly HeatCell[],
  pick: Pick,
  locale: AppLocale,
): LinePoint[] {
  const weeks = new Set(cells.map((cell) => periodKey(cell.date, 'weekly')));
  const byMonth = weeks.size > MAX_WEEKS;

  const buckets = new Map<string, number[]>();

  for (const cell of cells) {
    const key = byMonth
      ? cell.date.slice(0, 7)
      : periodKey(cell.date, 'weekly');
    const value = pick(cell);

    if (!buckets.has(key)) buckets.set(key, []);
    if (value !== null) buckets.get(key)?.push(value);
  }

  const points: LinePoint[] = [];

  for (const [key, values] of buckets) {
    if (values.length === 0) continue;

    points.push({
      key,
      label: byMonth ? monthLabel(key, locale) : shortDateLabel(key, locale),
      value: values.reduce((sum, value) => sum + value, 0) / values.length,
    });
  }

  return points;
}
