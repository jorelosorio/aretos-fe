export type CallbackStep = {
  kind: 'replace' | 'dismissTo' | 'push';
  href: '/' | '/welcome' | '/login';
};

/**
 * How the OAuth return leaves the navigation, as the steps to take in order.
 *
 * The redirect reaches `/auth/callback` by one of two routes. Usually the
 * link is handled by the mounted navigator and pushed on top of whatever was
 * open — the welcome screen and the sheet the person started from. But a
 * process that was restarted during the consent screen starts over with the
 * callback alone. `dismissTo` covers both: it returns to the welcome screen
 * already in the stack, or replaces the callback with one when there is
 * none, so back never reopens a stale sheet.
 *
 * A failure then reopens the log in sheet on top, where the error is shown;
 * a dismissed consent screen is not a failure and stops at the welcome
 * screen. Once signed in, the protected routes take over from `/`.
 */
export function callbackRoutes({
  isAuthenticated,
  failed,
}: {
  isAuthenticated: boolean;
  failed: boolean;
}): readonly CallbackStep[] {
  if (isAuthenticated) return [{ kind: 'replace', href: '/' }];

  const home: CallbackStep = { kind: 'dismissTo', href: '/welcome' };
  return failed ? [home, { kind: 'push', href: '/login' }] : [home];
}
