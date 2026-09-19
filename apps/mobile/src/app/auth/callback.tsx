import { Redirect } from 'expo-router';

import { ScreenLoader } from '@/components/common/screen-loader';
import { useSession, useSignInStatus } from '@/features/auth';

/**
 * Absorbs the OAuth redirect on Android, where it arrives twice.
 *
 * `openAuthSessionAsync` has no native counterpart on Android, so it is
 * polyfilled with a Custom Tab plus a `Linking` listener — which means the
 * backend's `aretos://auth/callback?code=…` is a real intent. expo-web-browser
 * takes it and resolves the promise in `features/auth/api.ts`; the router gets
 * its own copy and, without this file, renders Unmatched Route over a sign-in
 * that already worked. iOS never lands here: ASWebAuthenticationSession keeps
 * the redirect in-process.
 *
 * Nothing is read off the URL here. The code is single-use with a 60s TTL and
 * is already being spent by the call that opened the browser; a second reader
 * would race it and lose.
 */
export default function AuthCallbackScreen() {
  const { isAuthenticated } = useSession();
  const { isSigningIn } = useSignInStatus();

  // This screen, not the button, is what shows the exchange happening: the
  // same intent that routed us here reset the navigation state and took the
  // login screen down with it. Skipping it would flash an idle login screen
  // between the browser closing and the session landing.
  if (isSigningIn) return <ScreenLoader />;

  // Settled. A session sends the guard to the tabs; anything else — a failed
  // exchange, or a cold start that lost the listener along with the process —
  // belongs back at login, which now has the error to show for it.
  return <Redirect href={isAuthenticated ? '/' : '/login'} />;
}
