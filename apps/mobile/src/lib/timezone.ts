/**
 * The IANA zone this device is in, sent on every authenticated request as the
 * `X-Timezone` header.
 *
 * The server has no zone of its own any more. `users.timezone` was dropped
 * along with `?tz=`, and `shared.LoadTimezone` refuses an empty name rather
 * than defaulting to UTC — so `/v1/analysis`, `/v1/diary` and
 * `/v1/goals?include=progress` answer `400 TIMEZONE_REQUIRED` to a request
 * that does not carry one. A zone is never optional, which is why this always
 * returns a name.
 *
 * That inverts what this file used to do. It previously dropped "placeless"
 * zones — `UTC`, `GMT`, `Etc/*` — because none of them carries daylight
 * saving, so sending one pins the user to a fixed offset and moves their day
 * boundary twice a year. That was the right trade while dropping the zone
 * fell through to a stored one somebody had actually chosen. With no fallback
 * left it would trade a day boundary that is wrong twice a year for three
 * screens that are broken always, so the guard is gone.
 *
 * `Local` is still refused, because the server refuses it: it resolves to
 * whatever zone the process happens to run in, which is never what a client
 * meant and would answer the same request differently in two deployments.
 */

/**
 * What an unreadable device zone falls back to.
 *
 * A real IANA name the server accepts, not a sentinel. `Intl` is present on
 * Hermes with full ICU, which this app already depends on through `i18n-js`,
 * but a build configured without it throws here rather than returning
 * anything — and a thrown zone used to mean "send nothing", which is now a
 * refused request.
 */
const FALLBACK = 'UTC';

function resolve(): string {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!zone || zone === 'Local') return FALLBACK;
    return zone;
  } catch {
    return FALLBACK;
  }
}

/**
 * Read once and held, rather than asked of `Intl` per call.
 *
 * The zone reaches the server two ways — the header the request interceptor
 * sets, and the React Query keys of everything whose answer depends on it —
 * and those two happen at different moments. Two independent reads could
 * disagree across a zone change, storing a response computed in one zone
 * under a key naming the other. One held value cannot.
 */
let current = resolve();

export function deviceTimezone(): string {
  return current;
}

/**
 * Re-reads the device zone, reporting whether it moved.
 *
 * The only thing that changes `current`, so a caller that acts on `true` —
 * `providers/query-provider.tsx` invalidates the cache — is the single point
 * where a zone change takes effect. Nothing observes `Intl`, so a change is
 * noticed when this is called and not before: on foreground, which is when
 * the phone has finished the flight that caused it.
 */
export function refreshTimezone(): boolean {
  const next = resolve();
  if (next === current) return false;

  current = next;
  return true;
}
