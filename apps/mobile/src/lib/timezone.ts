/**
 * The IANA zone this device is in, for the `?tz=` the progress reads take.
 *
 * Sent per request rather than relying on the `users.timezone` the server
 * falls back to, because the phone is the only thing that knows the user got
 * on a plane. The stored zone stays the answer for every other client and for
 * anything the server does on its own.
 *
 * The name is what decides which period is "current" server-side, so a wrong
 * one moves the streak by a day — which is why a zone that is missing or
 * obviously unusable is dropped rather than sent. The server then resolves
 * the stored zone, and failing that UTC.
 */

/**
 * `Intl` is present on Hermes with full ICU, which this app already depends
 * on through `i18n-js`. It is still read defensively: a build configured
 * without ICU returns `undefined` here rather than throwing, and `"UTC"` is
 * what that looks like — indistinguishable from a device genuinely set to
 * UTC, so it is not worth sending.
 */
/**
 * Zones that name an offset rather than a place.
 *
 * All of them are valid IANA names the server would accept, and every one of
 * them is what an unconfigured device reports — a simulator says `GMT`, a
 * container says `UTC` or `Etc/UTC`. None carries daylight saving, so sending
 * one silently pins the user to a fixed offset and moves their day boundary
 * twice a year. Dropping them falls through to `users.timezone`, which is a
 * zone somebody actually chose.
 *
 * A user genuinely in London reports `Europe/London`, not `GMT`, so this
 * costs nothing real.
 */
const isPlaceless = (zone: string) =>
  zone === 'UTC' ||
  zone === 'GMT' ||
  zone === 'Local' ||
  zone.startsWith('Etc/');

export function deviceTimezone(): string | undefined {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // `Local` in particular is refused outright by the server, which would
    // otherwise resolve it to whatever zone the container runs in.
    if (!zone || isPlaceless(zone)) return undefined;

    return zone;
  } catch {
    return undefined;
  }
}
