import { connectAuth, toApiError } from '@/lib/api';

import { rotateRefreshToken } from './api';
import { isExpiring, sessionStore } from './session';
import type { Session } from './types';

/**
 * Serializes every refresh in the app onto one network call.
 *
 * This is not an optimization. `Refresh` in aretos-be treats a refresh token
 * presented twice as theft and revokes the **entire family**, signing the user
 * out on every device (`AUTH_REFRESH_REUSE_DETECTED`; see `docs/auth.md`). Two
 * parallel refreshes — two requests 401ing at once, a timer firing as the app
 * foregrounds — would do exactly that.
 */
let inFlight: Promise<Session | null> | null = null;

async function run(): Promise<Session | null> {
  const current = sessionStore.get();
  if (!current) return null;

  try {
    return await sessionStore.set(
      await rotateRefreshToken(current.refreshToken),
    );
  } catch (error) {
    const apiError = toApiError(error);

    // 401 (expired, revoked, reused) or 403 (tier lost API access): only a new
    // login fixes it. Anything else — offline, a 5xx — leaves the refresh
    // token valid, so keep the session; dropping it would sign people out
    // every time they walked into a tunnel.
    if (!apiError.isAuthError) throw error;

    await sessionStore.clear();
    return null;
  }
}

/**
 * Returns a session whose access token is good for at least the expiry skew,
 * refreshing only if it is not.
 *
 * @param force Refresh even if the token still looks valid — used after a 401,
 * where the server has told us it disagrees.
 */
export function ensureFreshSession(force = false): Promise<Session | null> {
  // Joining the call already running is what keeps refreshes serialized.
  if (inFlight) return inFlight;

  const current = sessionStore.get();
  if (!current) return Promise.resolve(null);
  if (!force && !isExpiring(current.expiresAt)) return Promise.resolve(current);

  inFlight = run().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/**
 * Closes the loop with axios, without `lib/` ever importing `features/`.
 * Runs on import; `providers/query-provider.tsx` pulls it in for the side
 * effect so it happens before any component can fire a request.
 */
connectAuth({
  async getAccessToken() {
    return (await ensureFreshSession())?.accessToken ?? null;
  },

  async renewAccessToken(staleToken) {
    const current = sessionStore.get();

    // A concurrent request may have refreshed between this one being sent and
    // its 401 coming back. Retrying with the token we now hold costs nothing;
    // refreshing again would rotate a token still in flight.
    if (current && current.accessToken !== staleToken)
      return current.accessToken;

    return (await ensureFreshSession(true))?.accessToken ?? null;
  },
});
