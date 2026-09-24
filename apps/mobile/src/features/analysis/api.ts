import { api } from '@/lib/api';
import { deviceTimezone } from '@/lib/timezone';

import { shiftPeriod, todayKey } from '@/features/logs';

import type {
  AnalysisGoal,
  AnalysisHabit,
  AnalysisReport,
  AnalysisThresholds,
  AnalysisWindow,
  Basis,
  Cadence,
  CalendarTally,
  Correlation,
  Coverage,
  Formation,
  HeatCell,
  Highlight,
  MoodBand,
  MoodDirection,
  MoodDistribution,
  MoodPerformance,
  OutcomeMix,
  Regularity,
  Series,
  Setup,
  Trend,
  TrendHalf,
  WeekdayCell,
  WeekdayExtremes,
  WireAnalysis,
  WireAnalysisGoal,
  WireAnalysisHabit,
  WireAnalysisThresholds,
  WireBand,
  WireBasis,
  WireCadence,
  WireCalendarTally,
  WireCorrelation,
  WireCoverage,
  WireFormation,
  WireHeatCell,
  WireHighlight,
  WireMoodDirection,
  WireMoodDistribution,
  WireMoodPerformance,
  WireOutcomeMix,
  WireRegularity,
  WireSeries,
  WireSetup,
  WireTrend,
  WireTrendHalf,
  WireWeekdayCell,
  WireWeekdayExtremes,
} from './types';

/** Requests for the analysis feature, mirroring `aretos-be/bruno/Analysis/`. */
const paths = {
  analysis: '/v1/analysis',
};

/**
 * The window the report is read over, resolved on the device.
 *
 * `today` and `from` both come from one call to `todayKey()`, so they cannot
 * describe different days. Sending `today` rather than letting the server
 * resolve its own is what closes the midnight gap: the device computing `from`
 * off its clock while the server derived `to` off its own would, for a few
 * hours a day, ask for a window neither of them meant.
 *
 * `to` is deliberately not sent. The server defaults it to whatever `today`
 * resolved to, which is the value we just supplied, so naming it again would
 * only create a second thing that can go stale.
 *
 * The zone itself is not here at all — it rides on the `X-Timezone` header
 * that `lib/api/client.ts` sets for every request.
 */
function analysisWindow(days: AnalysisWindow) {
  const today = todayKey();
  return { today, from: shiftPeriod(today, 'daily', -(days - 1)) };
}

/**
 * The shape a scope takes in a cache key.
 *
 * `zone` is key-only and is never sent. The zone reaches the server on a
 * header React Query cannot see, so without it here a traveller would be
 * handed the previous zone's report out of the cache. `today` is in the key
 * for the same reason at a finer grain: the report changes at midnight.
 *
 * `goalId` is genuinely a different report rather than a filtered view of one.
 * Narrowing re-computes every report-level reading over that goal's periods
 * alone — a weekday profile across three goals is not the same question as one
 * goal's — so the two cannot share an entry.
 */
function readParams(days: AnalysisWindow, goalId: string | null) {
  const { today, from } = analysisWindow(days);
  return { days, today, from, goalId, zone: deviceTimezone() };
}

/** Query keys for this feature, as a factory so they cannot drift apart. */
export const analysisKeys = {
  all: ['analysis'] as const,
  reports: () => [...analysisKeys.all, 'report'] as const,
  report: (days: AnalysisWindow, goalId: string | null = null) =>
    [...analysisKeys.reports(), readParams(days, goalId)] as const,
};

const toBasis = (wire: WireBasis): Basis => ({
  count: wire.count,
  unit: wire.unit,
  floor: wire.floor,
  thin: wire.thin,
});

const toCorrelation = (wire: WireCorrelation | null): Correlation | null =>
  wire === null
    ? null
    : {
        rho: wire.rho,
        n: wire.n,
        basis: toBasis(wire.basis),
        significant: wire.significant,
        strength: wire.strength,
      };

const toCoverage = (wire: WireCoverage): Coverage => ({
  count: wire.count,
  of: wire.of,
  rate: wire.rate,
});

const toBand = (wire: WireBand): MoodBand => ({ rate: wire.rate, n: wire.n });

const toMix = (wire: WireOutcomeMix): OutcomeMix => ({
  achieved: wire.achieved,
  missed: wire.missed,
  skipped: wire.skipped,
  blank: wire.blank,
  opportunities: wire.opportunities,
  total: wire.total,
  rate: wire.rate,
  basis: toBasis(wire.basis),
});

const toCadence = (wire: WireCadence): Cadence => ({
  periods: wire.periods,
  logged: wire.logged,
  empty: wire.empty,
  complete: wire.complete,
  partial: wire.partial,
  missed: wire.missed,
  skipped: wire.skipped,
  counted: wire.counted,
  loggingRate: wire.logging_rate,
  completionRate: wire.completion_rate,
  countedRate: wire.counted_rate,
  basis: toBasis(wire.basis),
});

const toWeekdayCell = (wire: WireWeekdayCell): WeekdayCell => ({
  weekday: wire.weekday,
  rate: wire.rate,
  n: wire.n,
  logged: wire.logged,
});

const toExtremes = (
  wire: WireWeekdayExtremes | null,
): WeekdayExtremes | null =>
  wire === null
    ? null
    : {
        best: toWeekdayCell(wire.best),
        worst: toWeekdayCell(wire.worst),
        spread: wire.spread,
        notable: wire.notable,
        basis: toBasis(wire.basis),
      };

const toRegularity = (wire: WireRegularity | null): Regularity | null =>
  wire === null
    ? null
    : {
        meanRate: wire.mean_rate,
        standardDeviation: wire.standard_deviation,
        coefficientOfVariation: wire.coefficient_of_variation,
        score: wire.score,
        band: wire.band,
        typicalLow: wire.typical_low,
        typicalHigh: wire.typical_high,
        n: wire.n,
        basis: toBasis(wire.basis),
      };

const toHalf = (wire: WireTrendHalf): TrendHalf => ({
  rate: wire.rate,
  n: wire.n,
  from: wire.from,
  to: wire.to,
  basis: toBasis(wire.basis),
});

const toTrend = (wire: WireTrend | null): Trend | null =>
  wire === null
    ? null
    : {
        first: toHalf(wire.first),
        second: toHalf(wire.second),
        delta: wire.delta,
        direction: wire.direction,
      };

const toMoods = (wire: WireMoodDistribution): MoodDistribution => ({
  counts: wire.counts,
  answered: wire.answered,
  total: wire.total,
  mean: wire.mean,
  responseRate: wire.response_rate,
  basis: toBasis(wire.basis),
});

const toMoodPerformance = (wire: WireMoodPerformance): MoodPerformance => ({
  low: toBand(wire.low),
  neutral: toBand(wire.neutral),
  high: toBand(wire.high),
  dependencyGap: wire.dependency_gap,
  automaticity: wire.automaticity,
  basis: toBasis(wire.basis),
  sameDay: toCorrelation(wire.same_day),
});

const toDirection = (wire: WireMoodDirection): MoodDirection => ({
  sameDay: toCorrelation(wire.same_day),
  moodLeads: toCorrelation(wire.mood_leads),
  performanceLeads: toCorrelation(wire.performance_leads),
});

const toCell = (wire: WireHeatCell): HeatCell => ({
  date: wire.date,
  periods: wire.periods,
  logged: wire.logged,
  skipped: wire.skipped,
  rate: wire.rate,
  mood: wire.mood,
  level: wire.level,
});

const toSetup = (wire: WireSetup): Setup => ({
  goals: wire.goals,
  habits: wire.habits,
  modes: wire.modes,
  planned: toCoverage(wire.planned),
  thresholded: toCoverage(wire.thresholded),
  weighted: toCoverage(wire.weighted),
});

const toFormation = (wire: WireFormation): Formation => ({
  repetitions: wire.repetitions,
  opportunities: wire.opportunities,
  skipped: wire.skipped,
  towardMedian: wire.toward_median,
  stage: wire.stage,
  spanDays: wire.span_days,
  first: wire.first,
  last: wire.last,
  basis: toBasis(wire.basis),
});

const toThresholds = (wire: WireAnalysisThresholds): AnalysisThresholds => ({
  minPairsForCorrelation: wire.min_pairs_for_correlation,
  minPerGroup: wire.min_per_group,
  thinMultiple: wire.thin_multiple,
  trendStep: wire.trend_step,
  heatBands: wire.heat_bands,
  heatLevels: wire.heat_levels,
  automaticGap: wire.automatic_gap,
  mixedGap: wire.mixed_gap,
  lallyMedianDays: wire.lally_median_days,
  lallyRangeDays: wire.lally_range_days,
  formationStages: wire.formation_stages,
  steadyScore: wire.steady_score,
  variableScore: wire.variable_score,
  notableSpread: wire.notable_spread,
  planNudgeBelow: wire.plan_nudge_below,
  maxHighlights: wire.max_highlights,
  seriesMaxWeeks: wire.series_max_weeks,
});

const toSeries = (wire: WireSeries): Series => ({
  step: wire.step,
  points: wire.points.map((point) => ({
    from: point.from,
    to: point.to,
    rate: point.rate,
    mood: point.mood,
    basis: toBasis(point.basis),
  })),
});

const toCalendar = (wire: WireCalendarTally): CalendarTally => ({
  due: wire.due,
  logged: wire.logged,
});

const toHighlight = (wire: WireHighlight): Highlight => ({
  kind: wire.kind,
  tone: wire.tone,
  // "" is the server's "not about one goal"; null is what the app means by it.
  goalId: wire.goal_id === '' ? null : wire.goal_id,
  habitIds: wire.habit_ids,
});

const toGoal = (wire: WireAnalysisGoal): AnalysisGoal => ({
  id: wire.id,
  name: wire.name,
  colorSlot: wire.color_slot,
  archived: wire.archived,
  trackingFrequency: wire.tracking_frequency,
  streakRule: wire.streak_rule,
  streakThreshold: wire.streak_threshold,
  activeHabits: wire.active_habits,
  trackedFrom: wire.tracked_from,
  currentStreak: wire.current_streak,
  longestStreak: wire.longest_streak,
  pending: wire.pending,
  // The server sends "" for a goal never logged; null is what the rest of the
  // app means by "there is no such date".
  lastEntryDate: wire.last_entry_date === '' ? null : wire.last_entry_date,
  mix: toMix(wire.mix),
  cadence: toCadence(wire.cadence),
  regularity: toRegularity(wire.regularity),
  trend: toTrend(wire.trend),
  moods: toMoods(wire.moods),
  heatmap: wire.heatmap.map(toCell),
  notedPeriods: wire.noted_periods,
});

const toHabit = (wire: WireAnalysisHabit): AnalysisHabit => ({
  id: wire.id,
  goalId: wire.goal_id,
  name: wire.name,
  trackingMode: wire.tracking_mode,
  weight: wire.weight,
  successThreshold: wire.success_threshold,
  hasIfThenPlan: wire.has_if_then_plan,
  mix: toMix(wire.mix),
  formation: toFormation(wire.formation),
});

/**
 * The report over one window, optionally narrowed to one goal.
 *
 * Naming a goal is also the only way an archived one appears: the report that
 * spans goals leaves them out, the same rule the diary and the habit list
 * follow.
 */
export async function getAnalysis(
  days: AnalysisWindow,
  goalId: string | null = null,
): Promise<AnalysisReport> {
  const { today, from } = analysisWindow(days);

  const { data } = await api.get<WireAnalysis>(paths.analysis, {
    params: {
      today,
      from,
      ...(goalId === null ? {} : { goal_id: goalId }),
    },
  });

  return {
    timezone: data.timezone,
    today: data.today,
    from: data.from,
    to: data.to,
    trackedFrom: data.tracked_from,
    goalId: data.goal_id === '' ? null : data.goal_id,
    thresholds: toThresholds(data.thresholds),
    setup: toSetup(data.setup),
    mix: toMix(data.mix),
    cadence: toCadence(data.cadence),
    profile: data.profile.map(toWeekdayCell),
    extremes: toExtremes(data.extremes),
    regularity: toRegularity(data.regularity),
    trend: toTrend(data.trend),
    moods: toMoods(data.moods),
    moodPerformance: toMoodPerformance(data.mood_performance),
    direction: toDirection(data.direction),
    heatmap: data.heatmap.map(toCell),
    calendar: toCalendar(data.calendar),
    series: toSeries(data.series),
    highlights: data.highlights.map(toHighlight),
    goals: data.goals.map(toGoal),
    habits: data.habits.map(toHabit),
  };
}
