/**
 * The server's highlights, put into words.
 *
 * Which findings the report leads with, in what order and how each one reads
 * is decided on the server (`internal/analysis/highlights.go`): it is a
 * judgement over the measurements, and a client making it would be telling
 * its own story about the same month. This file only speaks. A highlight
 * names a kind and points at the goal or habits it is about; the numbers for
 * the sentence are read from the blocks of the report it names, exactly as
 * the server sent them.
 *
 * So nothing here compares, sorts, filters by a threshold or counts. A
 * highlight whose block is missing — which the server never sends, but a
 * stale cache could — is dropped rather than worded from a guess.
 */

import type {
  AnalysisReport,
  Highlight,
  HighlightKind,
  HighlightTone,
} from '@/features/analysis';
import type { TranslateFn } from '@/lib/i18n';

import { formatRate, outOfTen } from '@/components/viz/format';

export type Insight = {
  key: string;
  kind: HighlightKind;
  tone: HighlightTone;
  text: string;
};

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

function word(
  highlight: Highlight,
  report: AnalysisReport,
  t: TranslateFn,
): string | null {
  const empty = t('analysis.empty');
  const median = report.thresholds.lallyMedianDays;

  switch (highlight.kind) {
    case 'trend': {
      const direction = report.trend?.direction;
      if (report.trend == null || direction == null) return null;
      return t(`analysis.insights.${direction}`, {
        from: formatRate(report.trend.first.rate, empty),
        to: formatRate(report.trend.second.rate, empty),
      });
    }

    case 'weekday': {
      const extremes = report.extremes;
      if (extremes === null) return null;
      return t('analysis.insights.weekday', {
        worst: t(
          `analysis.weekdayPlural.${WEEKDAY_KEYS[extremes.worst.weekday]}`,
        ),
        best: t(
          `analysis.weekdayPlural.${WEEKDAY_KEYS[extremes.best.weekday]}`,
        ),
        worstTen: outOfTen(extremes.worst.rate ?? 0),
        bestTen: outOfTen(extremes.best.rate ?? 0),
      });
    }

    case 'mood': {
      const { automaticity, low, high } = report.moodPerformance;
      if (automaticity === 'automatic') return t('analysis.insights.automatic');
      if (automaticity !== 'dependent') return null;
      return t('analysis.insights.dependent', {
        low: formatRate(low.rate, empty),
        high: formatRate(high.rate, empty),
      });
    }

    case 'formed': {
      const [only] = highlight.habitIds;
      if (highlight.habitIds.length !== 1) {
        return t('analysis.insights.formedMany', {
          count: highlight.habitIds.length,
          median,
        });
      }
      const habit = report.habits.find((entry) => entry.id === only);
      if (habit === undefined) return null;
      return t('analysis.insights.formedOne', { habit: habit.name, median });
    }

    case 'closest': {
      const habit = report.habits.find(
        (entry) => entry.id === highlight.habitIds[0],
      );
      if (habit === undefined) return null;
      return t('analysis.insights.closest', {
        habit: habit.name,
        count: habit.formation.repetitions,
        median,
      });
    }

    case 'streak': {
      const goal = report.goals.find((entry) => entry.id === highlight.goalId);
      if (goal === undefined) return null;
      return t('analysis.insights.streak', {
        count: goal.currentStreak,
        goal: goal.name,
      });
    }

    case 'plan':
      return t('analysis.insights.plan', {
        count: report.setup.planned.count,
        of: report.setup.planned.of,
      });
  }
}

export function wordHighlights(
  report: AnalysisReport,
  t: TranslateFn,
): Insight[] {
  return report.highlights.flatMap((highlight, index) => {
    const text = word(highlight, report, t);
    return text === null
      ? []
      : [
          {
            key: `${highlight.kind}-${index}`,
            kind: highlight.kind,
            tone: highlight.tone,
            text,
          },
        ];
  });
}
