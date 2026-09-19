import type { Translations } from './es';

export const en = {
  tabs: {
    home: 'Home',
    progress: 'Progress',
    diary: 'Diary',
    goals: 'My Goals',
  },
  home: {
    logEntry: 'Log entry',
    viewProgress: 'View my progress',
  },
  progress: {
    title: 'Progress',
  },
  diary: {
    title: 'Diary',
  },
  goals: {
    title: 'My Goals',
  },
  auth: {
    title: 'Aretos',
    tagline: 'Track your goals and watch your progress.',
    continueWithGoogle: 'Continue with Google',
    signingIn: 'Signing in…',
    signOut: 'Sign out',
    signingOut: 'Signing out…',
    signOutConfirmTitle: 'Sign out?',
    signOutConfirmBody: "You'll need to sign in with Google again.",
    cancel: 'Cancel',
    errors: {
      network: "We couldn't reach the server. Check your connection.",
      redirectNotAllowed:
        'This app is not authorized by the server. Let the team know.',
      emailNotVerified:
        'Your Google account has no verified email. Verify it and try again.',
      providerAuthFailed: "Google couldn't verify your account. Try again.",
      tierNotAllowed: 'Your plan does not include access to Aretos.',
      expiredCode: 'Sign-in took too long. Please try again.',
      sessionExpired: 'Your session ended. Please sign in again.',
      generic: 'Something went wrong. Please try again.',
    },
  },
} satisfies Translations;
