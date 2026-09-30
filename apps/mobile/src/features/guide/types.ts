import type { LogEntry } from '@/features/logs/types';

/**
 * The first-run guide: a goal, up to three habits and today's check-in,
 * held in memory until the guide's last input step writes them together.
 */

export type GuideStep =
  'welcome' | 'goal' | 'habits' | 'today' | 'saving' | 'done';

/**
 * Everything chosen so far. Habits are identified by their name, because
 * none of them exists on the server until the guide is saved.
 */
export type GuideDraft = {
  goalName: string;
  /**
   * The habit slots, exactly as the user left them: one per habit the goal
   * may take, `''` where a slot is still empty. `chosenHabits` is what they
   * amount to — trimmed, without blanks or repeats.
   */
  slots: string[];
  /**
   * Today's answer for each chosen habit, keyed by its name — done, not
   * today, skipped — exactly as the check-in records them. A habit with no
   * entry is unanswered. `habitId` holds the name until the save creates the
   * habit and swaps in its id.
   */
  today: Record<string, LogEntry>;
  /**
   * The trimmed goal name the habit list was last filled in for. Coming
   * back to the habits with the same name keeps the user's edits; a new
   * name starts the list again from that goal's suggestions.
   */
  seededFor: string | null;
  /** The goal's colour: the chosen suggestion's, or the forms' default. */
  colorSlot: number;
};

export const EMPTY_GUIDE: GuideDraft = {
  goalName: '',
  slots: [],
  today: {},
  seededFor: null,
  colorSlot: 0,
};

/**
 * What a save has already written. A failed save leaves this filled in up
 * to the request that failed, so saving again carries on from there instead
 * of creating a second goal.
 */
export type GuideProgress = {
  goalId: string | null;
  /** Habit name → id, for every habit already created. */
  habitIds: Record<string, string>;
  logged: boolean;
};

export const freshProgress = (): GuideProgress => ({
  goalId: null,
  habitIds: {},
  logged: false,
});
