/**
 * MOCK. The server does not count streaks yet.
 *
 * A goal carries a `streakRule` and a `streakThreshold` — the rule for what
 * counts — but no computed run, and the app only holds one week of logs, so
 * it cannot honestly count one on the device either. Until the endpoint
 * exists, the home screen shows a number from here.
 *
 * Derived from the goal's id rather than drawn at random, because a random
 * streak would change on every render: a card would read 12 days, then 4, then
 * 27 while the user scrolled. Hashing the id keeps each goal's number fixed
 * for as long as the goal exists, which is the one property that makes a fake
 * number survivable on screen.
 */

/** FNV-1a, 32-bit. Cheap, no dependency, and well spread over short strings. */
function hash(value: string): number {
  let result = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    // The FNV prime, via shifts: Math.imul keeps it in 32 bits on Hermes.
    result = Math.imul(result, 0x01000193);
  }

  return result >>> 0;
}

/** The longest run shown. Above this the number stops reading as plausible. */
const MAX_STREAK = 45;

export const mockStreak = (goalId: string) => hash(goalId) % (MAX_STREAK + 1);
