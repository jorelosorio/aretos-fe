export type PartOfDay = 'morning' | 'afternoon' | 'evening';

/**
 * Which greeting the clock calls for, read off the device's own time.
 *
 * This is presentation, not a calculation the server owns: it decides a
 * word, never a number anyone acts on, and it has to follow the phone into
 * a new time zone without a round trip. The cut-offs are the ones Spanish
 * uses — "buenas tardes" runs from lunch until dark, not from noon to five —
 * which English reads naturally enough too.
 */
export function partOfDay(now: Date): PartOfDay {
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 20) return 'afternoon';
  return 'evening';
}
