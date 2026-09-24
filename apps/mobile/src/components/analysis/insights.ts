/**
 * The report's headline findings, as sentences.
 *
 * The analysis response is a set of measurements, and every card below the
 * summary shows one of them. What none of them does on its own is say which
 * of those measurements is worth a person's attention *today* — the trend
 * turning, one weekday dragging, a habit about to cross the formation median.
 * This picks those out and words them, so the first thing on the tab is a
 * reading rather than a chart.
 *
 * It decides nothing the server did not already measure. Every number comes
 * straight off the report; this only chooses which ones to say and in what
 * order, and it says nothing a `null` would have to be guessed for — a
 * reading the sample could not support is simply not a candidate.
 *
 * Order is priority: a change of direction first, because it is the most
 * actionable and the most time-sensitive; then the specific leaks (a weekday,
 * a mood dependency); then progress worth celebrating; then setup nudges,
 * which are always true and so always last.
 */

import type { AnalysisReport } from '@/features/analysis';
import type { TranslateFn } from '@/lib/i18n';

import { formatRate, outOfTen } from '@/components/viz/format';

export type InsightTone = 'good' | 'watch' | 'info';

export type InsightKind =
  'trend' | 'weekday' | 'mood' | 'formed' | 'closest' | 'streak' | 'plan';

export type Insight = {
  kind: InsightKind;
  tone: InsightTone;
  text: string;
};

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

/**
 * The weekday spread worth a sentence. Below it the week is flat enough that
 * naming a "weak day" would single out noise.
 */
const NOTABLE_SPREAD = 0.15;

/**
 * Plan coverage under which the nudge appears. An if-then plan is the
 * best-evidenced intervention the app offers, so the bar is deliberately low:
 * half the habits without one is already worth a line.
 */
const PLAN_NUDGE_BELOW = 0.5;

const MAX_INSIGHTS = 4;

export function buildInsights(
  report: AnalysisReport,
  t: TranslateFn,
): Insight[] {
  const empty = t('analysis.empty');
  const found: Insight[] = [];

  const { trend, extremes, moodPerformance, habits, goals, setup } = report;
  const median = report.thresholds.lallyMedianDays;

  if (trend?.direction != null && trend.first.rate !== null) {
    const rates = {
      from: formatRate(trend.first.rate, empty),
      to: formatRate(trend.second.rate, empty),
    };

    found.push({
      kind: 'trend',
      tone:
        trend.direction === 'improving'
          ? 'good'
          : trend.direction === 'declining'
            ? 'watch'
            : 'info',
      text: t(`analysis.insights.${trend.direction}`, rates),
    });
  }

  if (extremes !== null && extremes.spread >= NOTABLE_SPREAD) {
    found.push({
      kind: 'weekday',
      tone: 'watch',
      text: t('analysis.insights.weekday', {
        worst: t(
          `analysis.weekdayPlural.${WEEKDAY_KEYS[extremes.worst.weekday]}`,
        ),
        best: t(
          `analysis.weekdayPlural.${WEEKDAY_KEYS[extremes.best.weekday]}`,
        ),
        worstTen: outOfTen(extremes.worst.rate ?? 0),
        bestTen: outOfTen(extremes.best.rate ?? 0),
      }),
    });
  }

  const automaticity = moodPerformance.automaticity;
  if (automaticity === 'automatic') {
    found.push({
      kind: 'mood',
      tone: 'good',
      text: t('analysis.insights.automatic'),
    });
  } else if (
    automaticity === 'dependent' &&
    moodPerformance.low.rate !== null &&
    moodPerformance.high.rate !== null
  ) {
    found.push({
      kind: 'mood',
      tone: 'watch',
      text: t('analysis.insights.dependent', {
        low: formatRate(moodPerformance.low.rate, empty),
        high: formatRate(moodPerformance.high.rate, empty),
      }),
    });
  }

  const formed = habits.filter((habit) => habit.formation.towardMedian >= 1);
  if (formed.length === 1) {
    found.push({
      kind: 'formed',
      tone: 'good',
      text: t('analysis.insights.formedOne', {
        habit: formed[0].name,
        median,
      }),
    });
  } else if (formed.length > 1) {
    found.push({
      kind: 'formed',
      tone: 'good',
      text: t('analysis.insights.formedMany', {
        count: formed.length,
        median,
      }),
    });
  }

  const closest = habits
    .filter(
      (habit) =>
        habit.formation.towardMedian < 1 && habit.formation.repetitions > 0,
    )
    .sort((a, b) => b.formation.towardMedian - a.formation.towardMedian)[0];
  if (closest !== undefined) {
    found.push({
      kind: 'closest',
      tone: 'info',
      text: t('analysis.insights.closest', {
        habit: closest.name,
        count: closest.formation.repetitions,
        median,
      }),
    });
  }

  const streaking = [...goals]
    .filter((goal) => goal.currentStreak > 1)
    .sort((a, b) => b.currentStreak - a.currentStreak)[0];
  if (streaking !== undefined) {
    found.push({
      kind: 'streak',
      tone: 'good',
      text: t('analysis.insights.streak', {
        count: streaking.currentStreak,
        goal: streaking.name,
      }),
    });
  }

  if (setup.planned.rate !== null && setup.planned.rate < PLAN_NUDGE_BELOW) {
    found.push({
      kind: 'plan',
      tone: 'info',
      text: t('analysis.insights.plan', {
        count: setup.planned.count,
        of: setup.planned.of,
      }),
    });
  }

  return found.slice(0, MAX_INSIGHTS);
}
