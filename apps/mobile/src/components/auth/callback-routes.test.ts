import { callbackRoutes } from './callback-routes';

describe('callbackRoutes', () => {
  it('goes into the app once signed in', () => {
    expect(callbackRoutes({ isAuthenticated: true, failed: false })).toEqual([
      { kind: 'replace', href: '/' },
    ]);
  });

  it('returns to the existing welcome screen, then reopens log in, when sign-in failed', () => {
    expect(callbackRoutes({ isAuthenticated: false, failed: true })).toEqual([
      { kind: 'dismissTo', href: '/welcome' },
      { kind: 'push', href: '/login' },
    ]);
  });

  it('returns to the existing welcome screen alone when consent was dismissed', () => {
    expect(callbackRoutes({ isAuthenticated: false, failed: false })).toEqual([
      { kind: 'dismissTo', href: '/welcome' },
    ]);
  });
});
