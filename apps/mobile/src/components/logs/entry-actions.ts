/**
 * What a tap on a tracked row means, in numbers.
 *
 * The check-in's rows are flat: the value control sits inline and the mark on
 * the rail doubles as "I did this". Both need to agree on how much one tap is
 * worth and on what counts as finished, and neither is a rendering decision,
 * so the two live here rather than in the components that draw them.
 */

import type { Habit, TrackingMode } from '@/features/habits';

/**
 * How much one press of `+` adds.
 *
 * Minutes move in fives because a duration typed one minute at a time is a
 * control nobody uses twice; counts and ratings are whole units by nature.
 * `binary` has no number to step and never asks.
 */
export function stepFor(mode: TrackingMode): number {
  return mode === 'duration' ? 5 : 1;
}

/**
 * The amount that marks a measured habit finished from the rail.
 *
 * Its own target when it has one, because that is the number the person
 * committed to. With no target any logged value clears the bar — see
 * `outcomeOf` — so a single step is enough to say it happened without
 * inventing a quantity they never named.
 */
export function completionAmount(habit: Habit): number {
  return habit.successThreshold ?? stepFor(habit.trackingMode);
}
