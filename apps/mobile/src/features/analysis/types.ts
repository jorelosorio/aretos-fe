/**
 * The inferential report, mirroring `GET /v1/analysis`
 * (`internal/api/v1/analysis_service.go`) field for field.
 *
 * Wire shapes keep the server's snake_case so a change there shows up here as
 * a type error rather than as a value that silently reads `undefined`.
 *
 * Two rules run through every type in this file.
 *
 * **Null is not zero.** Every reading the sample cannot support arrives
 * `null`: a correlation over four points is not a weak finding, it is not a
 * finding. A screen that renders one as `0%` reports something nobody
 * measured, so the nullability here is load-bearing and must not be widened
 * away with `?? 0`.
 *
 * **Every reading carries its `basis`,** and the floors it was judged against
 * travel in `thresholds` rather than being compiled in. A card reading "at
 * least 12 days are needed" starts lying the moment a floor moves.
 *
 * All rates are `0..1`, never `0..100`. The web app scales some of them in its
 * API layer and ends up comparing `score >= 70` and `spread >= 20` in one
 * file; nothing here does that. `components/viz/format.ts` is the only place a
 * percent is produced.
 */

import type { StreakRule, TrackingFrequency } from '@/features/goals';
import type { TrackingMode } from '@/features/habits';

/** What one observation is. The units are not interchangeable. */
export type AnalysisUnit =
  'answer' | 'period' | 'day' | 'weekday_day' | 'pair' | 'log';

export type CorrelationStrength = 'negligible' | 'weak' | 'moderate' | 'strong';

export type TrendDirection = 'improving' | 'steady' | 'declining';

export type Automaticity = 'automatic' | 'mixed' | 'dependent';

export type WireBasis = {
  count: number;
  unit: AnalysisUnit;
  /** `null` when nothing gated the reading. */
  floor: number | null;
  /** Cleared its floor but sits within `thin_multiple` of it. */
  thin: boolean;
};

export type WireCorrelation = {
  rho: number;
  n: number;
  basis: WireBasis;
  significant: boolean;
  strength: CorrelationStrength;
};

export type WireCoverage = {
  count: number;
  of: number;
  /** `null` when there is nothing to divide by, which is not a rate of zero. */
  rate: number | null;
};

export type WireBand = { rate: number | null; n: number };

export type WireOutcomeMix = {
  achieved: number;
  missed: number;
  skipped: number;
  blank: number;
  opportunities: number;
  total: number;
  rate: number | null;
  basis: WireBasis;
};

export type WireCadence = {
  periods: number;
  logged: number;
  empty: number;
  complete: number;
  partial: number;
  missed: number;
  skipped: number;
  counted: number;
  logging_rate: number | null;
  completion_rate: number | null;
  counted_rate: number | null;
  basis: WireBasis;
};

export type WireWeekdayCell = {
  /** 0 is Monday. What it is called is the client's business. */
  weekday: number;
  rate: number | null;
  n: number;
  logged: number;
};

export type WireWeekdayExtremes = {
  best: WireWeekdayCell;
  worst: WireWeekdayCell;
  spread: number;
  basis: WireBasis;
};

export type WireRegularity = {
  mean_rate: number;
  standard_deviation: number;
  coefficient_of_variation: number;
  score: number;
  n: number;
  basis: WireBasis;
};

export type WireTrendHalf = {
  rate: number | null;
  n: number;
  from: string;
  to: string;
  basis: WireBasis;
};

export type WireTrend = {
  first: WireTrendHalf;
  second: WireTrendHalf;
  delta: number | null;
  direction: TrendDirection | null;
};

export type WireMoodDistribution = {
  /** One entry per point on the scale; index 0 is a mood of 1. */
  counts: number[];
  answered: number;
  total: number;
  mean: number | null;
  response_rate: number | null;
  basis: WireBasis;
};

export type WireMoodPerformance = {
  low: WireBand;
  neutral: WireBand;
  high: WireBand;
  dependency_gap: number | null;
  automaticity: Automaticity | null;
  basis: WireBasis;
  same_day: WireCorrelation | null;
};

export type WireMoodDirection = {
  same_day: WireCorrelation | null;
  mood_leads: WireCorrelation | null;
  performance_leads: WireCorrelation | null;
};

export type WireHeatCell = {
  date: string;
  /** `0` means nothing was due that day. */
  periods: number;
  logged: number;
  skipped: number;
  rate: number | null;
  mood: number | null;
  /** `0`–`4`, or `null` when nothing was due. The two are not the same. */
  level: number | null;
};

export type WireSetup = {
  goals: number;
  habits: number;
  modes: Record<string, number>;
  planned: WireCoverage;
  thresholded: WireCoverage;
  weighted: WireCoverage;
};

export type WireFormation = {
  repetitions: number;
  opportunities: number;
  skipped: number;
  toward_median: number;
  span_days: number;
  first: string;
  last: string;
  basis: WireBasis;
};

export type WireAnalysisThresholds = {
  min_pairs_for_correlation: number;
  min_per_group: number;
  thin_multiple: number;
  trend_step: number;
  heat_bands: [number, number, number];
  heat_levels: number;
  automatic_gap: number;
  mixed_gap: number;
  lally_median_days: number;
  lally_range_days: [number, number];
};

export type WireAnalysisGoal = {
  id: string;
  name: string;
  color_slot: number;
  archived: boolean;
  tracking_frequency: TrackingFrequency;
  streak_rule: StreakRule;
  streak_threshold: number;
  active_habits: number;
  tracked_from: string;
  current_streak: number;
  longest_streak: number;
  pending: boolean;
  /** `""` when the goal has never been logged. */
  last_entry_date: string;
  mix: WireOutcomeMix;
  cadence: WireCadence;
  regularity: WireRegularity | null;
  trend: WireTrend | null;
  moods: WireMoodDistribution;
  heatmap: WireHeatCell[];
  noted_periods: number;
};

export type WireAnalysisHabit = {
  id: string;
  goal_id: string;
  name: string;
  tracking_mode: TrackingMode;
  weight: number;
  success_threshold: number | null;
  has_if_then_plan: boolean;
  mix: WireOutcomeMix;
  formation: WireFormation;
};

export type WireAnalysis = {
  timezone: string;
  today: string;
  from: string;
  to: string;
  tracked_from: string;
  /** `""` when the report spans every goal. */
  goal_id: string;
  thresholds: WireAnalysisThresholds;
  setup: WireSetup;
  mix: WireOutcomeMix;
  cadence: WireCadence;
  /** Always exactly seven cells, in order, Monday first. */
  profile: WireWeekdayCell[];
  extremes: WireWeekdayExtremes | null;
  regularity: WireRegularity | null;
  trend: WireTrend | null;
  moods: WireMoodDistribution;
  mood_performance: WireMoodPerformance;
  direction: WireMoodDirection;
  /** Always exactly as long as the window asked for, oldest first. */
  heatmap: WireHeatCell[];
  goals: WireAnalysisGoal[];
  habits: WireAnalysisHabit[];
};

export type Basis = {
  count: number;
  unit: AnalysisUnit;
  floor: number | null;
  thin: boolean;
};

export type Correlation = {
  rho: number;
  n: number;
  basis: Basis;
  significant: boolean;
  strength: CorrelationStrength;
};

export type Coverage = { count: number; of: number; rate: number | null };

export type MoodBand = { rate: number | null; n: number };

export type OutcomeMix = {
  achieved: number;
  missed: number;
  skipped: number;
  blank: number;
  /** achieved + missed: the denominator every rate is built on. */
  opportunities: number;
  total: number;
  rate: number | null;
  basis: Basis;
};

export type Cadence = {
  periods: number;
  logged: number;
  empty: number;
  complete: number;
  partial: number;
  missed: number;
  skipped: number;
  counted: number;
  /** Showing up. */
  loggingRate: number | null;
  /** Doing well once there. */
  completionRate: number | null;
  /** The share of the window that kept a streak alive. */
  countedRate: number | null;
  basis: Basis;
};

export type WeekdayCell = {
  weekday: number;
  rate: number | null;
  n: number;
  logged: number;
};

export type WeekdayExtremes = {
  best: WeekdayCell;
  worst: WeekdayCell;
  spread: number;
  basis: Basis;
};

export type Regularity = {
  meanRate: number;
  standardDeviation: number;
  coefficientOfVariation: number;
  /** `1 - CV`, clamped to `0..1`. Higher is steadier. */
  score: number;
  n: number;
  basis: Basis;
};

export type TrendHalf = {
  rate: number | null;
  n: number;
  from: string;
  to: string;
  basis: Basis;
};

export type Trend = {
  first: TrendHalf;
  second: TrendHalf;
  delta: number | null;
  direction: TrendDirection | null;
};

export type MoodDistribution = {
  counts: number[];
  answered: number;
  total: number;
  mean: number | null;
  responseRate: number | null;
  basis: Basis;
};

export type MoodPerformance = {
  low: MoodBand;
  neutral: MoodBand;
  high: MoodBand;
  /** high minus low. A SMALL gap is the good result. */
  dependencyGap: number | null;
  automaticity: Automaticity | null;
  basis: Basis;
  sameDay: Correlation | null;
};

export type MoodDirection = {
  sameDay: Correlation | null;
  moodLeads: Correlation | null;
  performanceLeads: Correlation | null;
};

export type HeatCell = {
  date: string;
  periods: number;
  logged: number;
  skipped: number;
  rate: number | null;
  mood: number | null;
  level: number | null;
};

export type Setup = {
  goals: number;
  habits: number;
  modes: Record<string, number>;
  planned: Coverage;
  thresholded: Coverage;
  weighted: Coverage;
};

export type Formation = {
  /** Periods achieved, not an unbroken run. */
  repetitions: number;
  opportunities: number;
  skipped: number;
  /** Repetitions against the 66-period median, capped at 1. */
  towardMedian: number;
  spanDays: number;
  first: string;
  last: string;
  basis: Basis;
};

export type AnalysisThresholds = {
  minPairsForCorrelation: number;
  minPerGroup: number;
  thinMultiple: number;
  trendStep: number;
  heatBands: [number, number, number];
  heatLevels: number;
  automaticGap: number;
  mixedGap: number;
  lallyMedianDays: number;
  lallyRangeDays: [number, number];
};

export type AnalysisGoal = {
  id: string;
  name: string;
  colorSlot: number;
  archived: boolean;
  trackingFrequency: TrackingFrequency;
  streakRule: StreakRule;
  streakThreshold: number;
  activeHabits: number;
  trackedFrom: string;
  currentStreak: number;
  longestStreak: number;
  pending: boolean;
  /** `null` when the goal has never been logged. */
  lastEntryDate: string | null;
  mix: OutcomeMix;
  cadence: Cadence;
  regularity: Regularity | null;
  trend: Trend | null;
  moods: MoodDistribution;
  heatmap: HeatCell[];
  notedPeriods: number;
};

export type AnalysisHabit = {
  id: string;
  goalId: string;
  name: string;
  trackingMode: TrackingMode;
  weight: number;
  successThreshold: number | null;
  hasIfThenPlan: boolean;
  mix: OutcomeMix;
  /** Over the whole history, not the window. */
  formation: Formation;
};

export type AnalysisReport = {
  timezone: string;
  today: string;
  from: string;
  to: string;
  /**
   * The first day of the window anything was already tracked. The readings
   * that divide the window use it, so a 90-day window over a three-week-old
   * account is not read as 69 days of failure.
   */
  trackedFrom: string;
  /** `null` when the report spans every goal. */
  goalId: string | null;
  thresholds: AnalysisThresholds;
  setup: Setup;
  mix: OutcomeMix;
  cadence: Cadence;
  profile: WeekdayCell[];
  extremes: WeekdayExtremes | null;
  regularity: Regularity | null;
  trend: Trend | null;
  moods: MoodDistribution;
  moodPerformance: MoodPerformance;
  direction: MoodDirection;
  heatmap: HeatCell[];
  goals: AnalysisGoal[];
  habits: AnalysisHabit[];
};

/**
 * The windows the tab offers, in days.
 *
 * 365 sits inside the server's 400-day cap. 90 is the server's own default and
 * is long enough for a weekday bucket to clear its per-group floor — thirteen
 * of each weekday — and for a correlation to have something to stand on.
 */
export const ANALYSIS_WINDOWS = [30, 90, 365] as const;

export type AnalysisWindow = (typeof ANALYSIS_WINDOWS)[number];

/** The subset of `internal/api/errors/codes.go` this feature reacts to. */
export const AnalysisErrorCode = {
  /** A window that ends before it starts, or one 400 days or more wide. */
  BadRequest: 'BAD_REQUEST',
  /**
   * The plan does not cover the report. Nothing is gated server-side today —
   * `entitled` in `analysis_service.go` lets every tier through — but that
   * function is the documented place a gate would go, and it answers here.
   */
  TierNotAllowed: 'AUTHZ_TIER_NOT_ALLOWED',
} as const;
