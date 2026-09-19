import type { Translations } from './es';

export const en = {
  tabs: {
    home: 'Home',
    progress: 'Progress',
    diary: 'Diary',
    goals: 'My Goals',
    settings: 'Settings',
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
    tagline:
      'Each goal is something big. Inside it go the concrete actions that make it real.',
    new: 'New goal',
    actions: 'Options',
    archive: 'Archive',
    restore: 'Restore',
    filter: {
      active: 'Active',
      archived: 'Archived',
    },
    delete: 'Delete',
    deleteConfirmTitle: 'Delete this goal?',
    deleteConfirmBody: 'Its habits and logs go with it. This cannot be undone.',
    limit: {
      usage: '%{used} of %{limit} goals on your plan',
      title: 'Track several goals at once',
      reached:
        'You are using %{used} of %{limit}. You can add as many actions as you like to the ones you have; with Premium you follow several goals at once and see which is moving and which is stalling.',
      blockedTitle: 'Start with your first goal',
      blocked:
        'Your plan does not include goals yet. Upgrade it to start tracking what matters to you.',
    },
    empty: {
      title: 'No goals yet',
      body: 'Start with the big one, even if it sounds abstract. You will turn it into actions you can tick without second-guessing.',
      archivedTitle: 'No archived goals',
      archivedBody:
        'Goals you archive show up here, with their history intact.',
    },
    form: {
      newTitle: 'New goal',
      editTitle: 'Edit goal',
      name: 'Name',
      namePlaceholder: 'e.g. Work with excellence',
      description: 'Description (optional)',
      descriptionPlaceholder: 'Why does this goal matter to you?',
      frequency: 'Your cadence',
      streakRule: 'What keeps the streak alive?',
      threshold: 'Minimum',
      create: 'Create goal',
      save: 'Save changes',
    },
    frequency: {
      daily: 'Daily',
      dailyHint: 'Every day counts as one period for the streak.',
      weekly: 'Weekly',
      weeklyHint: 'Every week counts as one period for the streak.',
      flexible: 'Flexible',
      flexibleHint: 'Log whenever you like; the streak is measured weekly.',
    },
    streak: {
      logged: 'Logging it, even partially',
      loggedHint: 'Showing up counts. The most sustainable option.',
      threshold: 'Hitting a minimum',
      thresholdHint:
        'The period only counts if you reach the percentage you pick.',
    },
    errors: {
      title: 'Something went wrong',
      limitReached: 'Your plan does not allow more goals.',
      notFound: 'That goal no longer exists.',
      network: "We couldn't reach the server. Check your connection.",
      generic: 'Something went wrong. Please try again.',
    },
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
  settings: {
    appearance: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    system: 'Automatic',
    language: 'Language',
  },
} satisfies Translations;
