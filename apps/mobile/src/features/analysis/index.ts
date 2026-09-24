/** Public surface of the analysis feature — nothing outside it should reach deeper. */
export { analysisKeys, getAnalysis } from './api';
export { useAnalysis, useAnalysisErrorMessage } from './hooks';
export { ANALYSIS_WINDOWS, AnalysisErrorCode } from './types';
export type {
  AnalysisGoal,
  AnalysisHabit,
  AnalysisReport,
  AnalysisThresholds,
  AnalysisUnit,
  AnalysisWindow,
  Automaticity,
  Basis,
  Cadence,
  Correlation,
  CorrelationStrength,
  Coverage,
  Formation,
  HeatCell,
  MoodBand,
  MoodDirection,
  MoodDistribution,
  MoodPerformance,
  OutcomeMix,
  Regularity,
  Setup,
  Trend,
  TrendDirection,
  TrendHalf,
  WeekdayCell,
  WeekdayExtremes,
} from './types';
