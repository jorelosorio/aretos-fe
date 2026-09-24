import type { Translations } from './es';

export const en = {
  tabs: {
    home: 'Home',
    log: 'Log',
    diary: 'Diary',
    analysis: 'Analysis',
    goals: 'My Goals',
    settings: 'Settings',
  },
  home: {
    greeting: 'Hello, %{name}',
    welcomeBack: 'Welcome back',
    streaks: {
      days: '%{count} d',
      none: 'No streak',
      label: '%{count} day streak',
    },
    today: {
      title: "Today's report",
    },
    week: {
      counted: '%{count} count toward the streak',
      summary: '%{complete} of %{total} periods complete',
    },
    noHabits: 'No habits yet',
    openCheckIn: 'Opens this goal’s check-in',
  },
  diary: {
    title: 'Diary',
    entry: {
      more: '+%{count} more',
    },
    close: 'Close',
    empty: {
      title: 'Your diary is empty',
      body: 'Every check-in you save shows up here, with its note and how you felt.',
    },
    cutoff: {
      title: 'This is as far as your plan reads',
      body: 'Your plan shows the diary from %{date}. Anything older is still saved and comes back if you upgrade.',
    },
    errors: {
      badRequest: "We couldn't read the diary. Try again.",
      network: "We couldn't reach the server. Check your connection.",
      generic: 'Something went wrong. Try again.',
    },
  },
  analysis: {
    title: 'Analysis',
    empty: 'no data',
    errors: {
      badRequest: "We couldn't read the analysis. Try again.",
      locked: "Your plan doesn't include the analysis.",
      network: "We couldn't reach the server. Check your connection.",
      generic: 'Something went wrong. Try again.',
    },
    units: {
      answer: '%{count} answers',
      period: '%{count} periods',
      day: '%{count} days',
      weekday_day: '%{count} days',
      pair: '%{count} day pairs',
      log: '%{count} entries',
    },
    basis: {
      thin: '%{sample} · provisional',
    },
    notEnough: {
      title: 'Not enough yet',
      body: 'We need %{need} before we can say anything solid.',
    },
    window: {
      '30': '30 days',
      '90': '90 days',
      '365': '1 year',
    },
    scope: {
      all: 'All goals',
    },
    section: {
      summary: 'Summary',
      rhythm: 'Rhythm',
      mood: 'Mood',
      detail: 'Detail',
    },
    sectionHint: {
      summary: 'How often you show up, and how much you finish when you do.',
      rhythm:
        'Where your strong and weak days fall, and which way you are going.',
      mood: 'How much what you do depends on how you feel.',
      detail: 'Goal by goal, and habit by habit.',
    },
    setup: {
      title: 'Your setup',
      subtitle:
        'How measurable what you track is. This can be answered before your first entry.',
      counts: '%{goals} goals · %{habits} active habits',
      planned: 'With a plan',
      thresholded: 'With a threshold',
      weighted: 'With weights',
    },
    cadence: {
      title: 'Consistency',
      subtitle:
        'Showing up and doing well are different questions. A streak breaks in one day; this does not.',
      logging: 'Logged',
      completion: 'Completed',
      counted: 'Counts for the streak',
      status: {
        complete: 'Complete',
        partial: 'Partial',
        missed: 'Missed',
        skipped: 'Skipped',
        empty: 'No entry',
      },
    },
    mix: {
      title: 'What your rate is made of',
      subtitle:
        'Every answer falls into one of four states. Only the first two enter the calculation.',
      achieved: 'Achieved',
      missed: 'Not achieved',
      skipped: 'Not applicable',
      blank: 'No answer',
      center: '%{achieved} of %{opportunities} opportunities',
      excluded:
        '%{count} answers fell outside the rate: %{skipped} did not apply and %{blank} went unanswered. That is deliberate, but it means your rate describes a smaller base than it looks.',
    },
    weekday: {
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
      sun: 'Sun',
    },
    rhythm: {
      title: 'Your weekly rhythm',
      subtitle:
        'The average hides the shape of the week. This shows whether one particular day is getting away from you.',
      spreadLabel: 'Gap between your best and worst day',
      spreadValue: '%{points} pts',
      spreadReading:
        '%{best} is your strong day (%{bestRate}) and %{worst} the weakest (%{worstRate}). A gap like that is usually a calendar problem, not a willpower one.',
      needExtremes: '%{count} days for each day of the week',
      regularityLabel: 'Regularity',
      regularityReading:
        'Your days vary by ±%{deviation} points around %{mean}.',
      needRegularity: '%{count} days with an entry',
    },
    trend: {
      title: 'Are you improving?',
      subtitle:
        'The second half of the window against the first, split by date.',
      first: 'First half',
      second: 'Second half',
      half: '%{count} days',
      deltaLabel: 'Change',
      deltaValue: '%{points} pts',
      direction: {
        improving: 'You are improving.',
        steady: 'You are holding steady.',
        declining: 'You are slipping.',
      },
      need: '%{count} days in each half',
    },
    strength: {
      negligible: 'Negligible',
      weak: 'Weak',
      moderate: 'Moderate',
      strong: 'Strong',
    },
    moods: {
      title: 'Your mood',
      subtitle: 'How you used the 1-5 scale, and how often you answered it.',
      summary: 'You answered in %{answered} of %{total} entries (%{rate}).',
    },
    moodPerformance: {
      title: 'Mood against achievement',
      subtitle:
        'How much your behaviour depends on how you feel. A small gap is the good result.',
      low: 'Low days',
      neutral: 'Neutral days',
      high: 'Good days',
      days: '%{count} days',
      gapLabel: 'Mood gap',
      gapValue: '%{points} pts',
      automaticity: {
        automatic:
          'Your behaviour holds up as well on bad days as on good ones. That is what a formed habit does.',
        mixed: 'Your behaviour partly holds up, but mood still weighs on it.',
        dependent:
          'Your behaviour still rides on how you feel. A concrete plan for the low days is usually what closes that gap.',
      },
      need: '%{count} days at each end of the scale',
    },
    direction: {
      title: 'Direction',
      subtitle:
        'The same day cannot separate cause from effect. Pairing each day with the next one breaks that symmetry.',
      sameDay: 'Mood and achievement, same day',
      moodLeads: 'Mood today → achievement tomorrow',
      performanceLeads: 'Achievement today → mood tomorrow',
      caveat:
        'This narrows the possibilities, it does not settle them: anything that moved both would show up in either column.',
      need: '%{count} pairs of consecutive days',
    },
    heatmap: {
      title: 'Consistency map',
      subtitle:
        'One square per day. Blank days had nothing due — they are not misses.',
      less: 'Less',
      more: 'More',
      summary: '%{logged} days logged out of %{tracked} with something due.',
    },
    goals: {
      title: 'Per goal',
      subtitle:
        'Each goal with its own calendar. For a weekly goal this is the only one that reads correctly.',
      streaks: 'Streak %{current} · longest %{longest}',
    },
    habits: {
      title: 'Your habits',
      subtitle:
        'Each habit on its own. The median to automate one is %{median} repetitions, with an observed range of %{low} to %{high}.',
      formation: 'Formation',
      repetitions: '%{count} of %{median} repetitions',
      span: 'Across %{count} days',
    },
  },
  logs: {
    mood: {
      question: 'How did you feel?',
      optional: '(optional)',
      scaleLabel: 'How you felt, from 1 to 5',
      clearHint: 'Tap again to clear your answer',
      scale: {
        '1': 'Very bad',
        '2': 'Bad',
        '3': 'Okay',
        '4': 'Good',
        '5': 'Very good',
      },
    },
    optional: '(optional)',
    close: 'Close',
    pickTitle: 'Log',
    pickGoal: 'Which goal are you logging?',
    period: {
      previousWeek: 'Previous week',
      nextWeek: 'Next week',
      today: 'Today',
      week: 'Week of %{date}',
    },
    status: {
      complete: 'Complete',
      partial: 'On the way',
      missed: 'Not this time',
      skipped: "Didn't apply",
      empty: 'Not reported',
    },
    outcome: {
      done: 'Done',
      missed: 'Not this time',
      skipped: "Doesn't apply",
      pending: 'Unanswered',
    },
    tap: {
      done: 'Tap to mark it',
      amount: 'Tap to add one',
    },
    editing: "You're editing a saved entry",
    progress: '%{answered} of %{total}',
    save: 'Save',
    update: 'Update',
    note: 'Note',
    noteEditor: {
      open: 'Expand the note',
      collapse: 'Collapse the note',
    },
    notePlaceholder: 'What made it go this way?',
    entry: {
      done: 'Done',
      notDone: 'Not today',
      skip: "Doesn't apply",
      unskip: 'It does apply',
      skipped: "Doesn't apply this period",
      target: 'Target: %{target} %{unit}',
      plan: 'My plan',
      clear: 'Tap again to clear your answer',
    },
    empty: {
      noHabitsTitle: 'This goal has no habits',
      noHabitsBody:
        'A goal is logged through its habits. Add the first one and come back.',
      noHabitsAction: 'Add a habit',
    },
    errors: {
      title: 'Something went wrong',
      limitReached: 'Your plan does not allow more entries.',
      notFound: 'That entry no longer exists.',
      goalArchived:
        'This goal is archived. Restore it before logging anything else.',
      loadFailed: "We couldn't open this period. Try again.",
      network: "We couldn't reach the server. Check your connection.",
      generic: 'Something went wrong. Try again.',
    },
  },
  goals: {
    title: 'My Goals',
    tagline:
      'Each goal is something big. Inside it go the concrete habits that make it real.',
    progress: '%{answered} of %{total}',
    new: 'New goal',
    actions: 'Options',
    edit: 'Edit goal',
    archive: 'Archive',
    restore: 'Restore',
    filter: {
      active: 'Active',
      archived: 'Archived',
    },
    delete: 'Delete',
    deleteConfirmTitle: 'Delete this goal?',
    deleteConfirmBody: 'Its habits and logs go with it. This cannot be undone.',
    archivedNotice: {
      title: 'This goal is archived',
      body: 'Its habits and history stay as they are. Restore it from the menu above to make changes again.',
    },
    stats: {
      habits: 'Habits',
      frequency: 'Cadence',
      streak: 'Streak',
    },
    limit: {
      usage: '%{used} of %{limit} goals on your plan',
      title: 'Track several goals at once',
      reached:
        'You are using %{used} of %{limit}. You can add as many habits as you like to the goals you have; with Premium you follow several goals at once and see which is moving and which is stalling.',
      blockedTitle: 'Start with your first goal',
      blocked:
        'Your plan does not include goals yet. Upgrade it to start tracking what matters to you.',
    },
    empty: {
      title: 'No goals created yet',
      body: 'Start with the big one, even if it sounds abstract. You will turn it into habits you can tick without second-guessing.',
      archivedTitle: 'No archived goals',
      archivedBody:
        'Goals you archive show up here, with their history intact.',
    },
    form: {
      newTitle: 'New goal',
      editTitle: 'Edit goal',
      name: 'Name',
      namePlaceholder: 'e.g. Work with excellence',
      nameHint: 'The big goal, in your words. The details come later.',
      description: 'Description (optional)',
      descriptionPlaceholder: 'Why does it matter to you?',
      frequency: 'Your cadence',
      streakRule: 'What keeps the streak alive?',
      threshold: 'Minimum',
      create: 'Create',
      save: 'Save',
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
      loggedShort: 'Logging',
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
      archived: 'This goal is archived. Restore it before making changes.',
      network: "We couldn't reach the server. Check your connection.",
      generic: 'Something went wrong. Please try again.',
    },
  },
  habits: {
    section: 'Habits',
    countOne: '%{count} habit',
    countMany: '%{count} habits',
    new: 'Add a habit',
    actions: 'Options',
    archive: 'Archive',
    restore: 'Restore',
    delete: 'Delete',
    deleteConfirmTitle: 'Delete this habit?',
    deleteConfirmBody: 'Its logs go with it. This cannot be undone.',
    weight: {
      normal: 'Normal',
      double: 'Medium',
      triple: 'High',
      doubleBadge: 'Medium importance',
      tripleBadge: 'High importance',
    },
    weightBadge: '×%{weight}',
    targetBadge: '≥ %{target} %{unit}',
    empty: {
      title: 'No habits yet',
      body: 'A goal becomes real when you turn it into habits you can tick without having to interpret them.',
    },
    form: {
      newTitle: 'New habit',
      editTitle: 'Edit habit',
      name: 'Habit',
      namePlaceholder: 'e.g. Arrive on time',
      nameHint: 'Something concrete you can tick without interpreting it.',
      mode: 'How do you log it?',
      target: 'Success threshold',
      targetHint: 'From here up, it counts as done.',
      weight: 'Importance',
      weightHint:
        'The more important a habit, the further it moves the goal: medium counts double a normal one, high counts triple.',
      plan: 'If-then plan (optional)',
      planPlaceholder: 'If… then…',
      planHint:
        'e.g. "If it\'s 7:15 a.m., then I leave the house even if I haven\'t finished my coffee." Deciding when and where you will do it beforehand is what most raises the odds that you will.',
      create: 'Add',
      save: 'Save',
    },
    mode: {
      binary: 'Yes / No',
      binaryHint:
        'You did it or you did not. The least friction possible — ideal for character habits.',
      count: 'Count',
      countHint: 'Count how many times it happened (calls made, thanks given).',
      duration: 'Duration',
      durationHint: 'Log minutes (deep work, reading, exercise).',
      rating: 'Scale 1-5',
      ratingHint: 'Rate the intensity yourself when there is no honest yes/no.',
    },
    unit: {
      count: 'times',
      duration: 'min',
      rating: 'of 5',
    },
    errors: {
      title: 'Something went wrong',
      limitReached: 'Your plan does not allow more habits.',
      notFound: 'That habit no longer exists.',
      goalArchived:
        'Its goal is archived. Restore the goal before making changes.',
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
    attributions: 'Attributions',
    legal: 'Legal',
    licenses: 'Licenses',
    light: 'Light',
    dark: 'Dark',
    system: 'Automatic',
    language: 'Language',
  },
} satisfies Translations;
