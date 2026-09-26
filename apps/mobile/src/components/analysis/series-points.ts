/**
 * The server's series, as points a line chart can draw.
 *
 * The averaging is the server's (`internal/analysis/series.go`): which days
 * fall in a step, and whether the step is a week or a month, are
 * measurement decisions. This only labels each step and leaves out the ones
 * the server sent as `null` — a step with nothing measured is a gap in the
 * line, never a point at zero, which is what the API asks a client to do
 * with it.
 */

import type { Series, SeriesPoint } from '@/features/analysis';
import type { AppLocale } from '@/lib/i18n';

import { shortDateLabel } from '@/components/common/date-label';
import { dateFormat } from '@/utils/date-format';
import { capitalize } from '@/utils/text';
import type { LinePoint } from '@/components/viz/line-chart';

function monthLabel(key: string, locale: AppLocale): string {
  const [year, month] = key.split('-').map(Number);
  return capitalize(
    dateFormat(locale, { month: 'short' }).format(new Date(year, month - 1, 1)),
  );
}

export function seriesPoints(
  series: Series,
  pick: (point: SeriesPoint) => number | null,
  locale: AppLocale,
): LinePoint[] {
  return series.points.flatMap((point) => {
    const value = pick(point);
    if (value === null) return [];

    return [
      {
        key: point.from,
        label:
          series.step === 'month'
            ? monthLabel(point.from, locale)
            : shortDateLabel(point.from, locale),
        value,
      },
    ];
  });
}
