import type { Habit } from '@/features/habits/types';
import { emptyEntry, type LogEntry } from '@/features/logs/types';

import type { GuideDraft, GuideStep } from './types';

/**
 * The guide's order and the rules for moving through it. Pure, so the
 * screen only asks "may the user continue?" and "what does the draft look
 * like after this tap?" and never decides either itself.
 */

export const GUIDE_STEPS = [
  'goal',
  'habits',
  'today',
  'saving',
  'done',
] as const satisfies readonly GuideStep[];

/** The steps the progress lines count: the ones the user fills in. */
export const INPUT_STEPS = [
  'goal',
  'habits',
  'today',
] as const satisfies readonly GuideStep[];

export type InputStep = (typeof INPUT_STEPS)[number];

/**
 * Three habits at most. The guide is an introduction: enough to see a goal
 * made checkable, not the whole list. More are added from the goal later.
 */
export const MAX_GUIDE_HABITS = 3;

/** The same limits the full goal and habit forms apply. */
export const GOAL_NAME_MAX = 120;
export const HABIT_NAME_MAX = 200;

export function nextStep(step: GuideStep): GuideStep {
  const index = GUIDE_STEPS.indexOf(step);
  return GUIDE_STEPS[Math.min(index + 1, GUIDE_STEPS.length - 1)];
}

/**
 * The step behind this one, or `null` where there is none to go back to:
 * the first step, and every step from the save on — by then the goal may
 * already exist, so the draft that described it can no longer change.
 */
export function previousStep(step: GuideStep): GuideStep | null {
  if (step === 'goal' || step === 'saving' || step === 'done') return null;
  return GUIDE_STEPS[GUIDE_STEPS.indexOf(step) - 1];
}

export function canContinue(step: GuideStep, draft: GuideDraft): boolean {
  switch (step) {
    case 'goal':
      return draft.goalName.trim() !== '';
    case 'habits':
      return (
        draft.goalName.trim() !== '' &&
        draft.slots.length > 0 &&
        chosenHabits(draft).length === draft.slots.length
      );
    case 'today': {
      const { done, skipped } = todayRequirements(draft);
      return draft.goalName.trim() !== '' && done && skipped !== false;
    }
    case 'saving':
    case 'done':
      return false;
  }
}

/**
 * How many habit slots the guide opens: three, or what the plan still
 * allows when that is fewer. `null` is a plan without a habit limit.
 */
export function habitCap(remaining: number | null): number {
  return Math.max(0, Math.min(MAX_GUIDE_HABITS, remaining ?? MAX_GUIDE_HABITS));
}

const sameName = (a: string, b: string) =>
  a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();

const includesName = (list: readonly string[], name: string) =>
  list.some((item) => sameName(item, name));

/**
 * The habits the slots amount to, in slot order: trimmed, with empty slots
 * left out and a name typed twice kept once. This, not `slots`, is what the
 * next steps show and what the save creates.
 */
export function chosenHabits(draft: GuideDraft): string[] {
  const chosen: string[] = [];
  for (const slot of draft.slots) {
    const name = slot.trim();
    if (name !== '' && !includesName(chosen, name)) chosen.push(name);
  }
  return chosen;
}

/**
 * How many slots hold a habit of their own, against how many the step asks
 * for: every slot it opened — three, or fewer when the plan allows fewer. A
 * name typed twice fills one.
 */
export function habitsFilled(draft: GuideDraft): {
  filled: number;
  total: number;
} {
  return { filled: chosenHabits(draft).length, total: draft.slots.length };
}

/** Whether a suggestion still has somewhere to go. */
export function hasFreeSlot(draft: GuideDraft): boolean {
  return draft.slots.some((slot) => slot.trim() === '');
}

/**
 * The draft as the habits step should open it.
 *
 * The first time, and whenever the goal name has changed since, the slots
 * start from that goal's suggestions, with the rest left empty. Otherwise
 * the user is coming back to slots they already edited, and they are
 * returned as they are.
 */
export function enterHabits(
  draft: GuideDraft,
  suggestions: readonly string[],
  cap: number,
): GuideDraft {
  const name = draft.goalName.trim();
  if (draft.seededFor === name) return draft;

  const seeded = suggestions.slice(0, cap);
  return {
    ...draft,
    slots: [...seeded, ...Array<string>(cap - seeded.length).fill('')],
    today: {},
    seededFor: name,
  };
}

/** Keeps today's answers to the habits the slots still hold. */
const withChosenMarks = (draft: GuideDraft): GuideDraft => {
  const chosen = chosenHabits(draft);
  return {
    ...draft,
    today: Object.fromEntries(
      Object.entries(draft.today).filter(([name]) => chosen.includes(name)),
    ),
  };
};

/** A tapped suggestion goes into the first empty slot. */
export function fillSlot(draft: GuideDraft, name: string): GuideDraft {
  const index = draft.slots.findIndex((slot) => slot.trim() === '');
  if (index === -1 || includesName(chosenHabits(draft), name)) return draft;
  return editSlot(draft, index, name.trim());
}

/** What the user types into a slot, kept as typed. */
export function editSlot(
  draft: GuideDraft,
  index: number,
  value: string,
): GuideDraft {
  return withChosenMarks({
    ...draft,
    slots: draft.slots.map((slot, at) => (at === index ? value : slot)),
  });
}

export function clearSlot(draft: GuideDraft, index: number): GuideDraft {
  return editSlot(draft, index, '');
}

/**
 * A chosen habit as the check-in's list draws it, before it exists: a plain
 * yes-or-no habit, which is all the guide creates, identified by its name.
 * `achievedWhen` is what the server sends for every binary habit.
 */
export function draftHabit(name: string): Habit {
  return {
    id: name,
    goalId: '',
    name,
    trackingMode: 'binary',
    weight: 1,
    successThreshold: null,
    achievedWhen: { compare: 'true', value: null },
    ifThenPlan: '',
    archived: false,
    createdAt: '',
    updatedAt: '',
  };
}

export function entryFor(draft: GuideDraft, name: string): LogEntry {
  return draft.today[name] ?? emptyEntry(name);
}

export function setEntry(
  draft: GuideDraft,
  name: string,
  patch: Partial<Omit<LogEntry, 'habitId'>>,
): GuideDraft {
  if (!chosenHabits(draft).includes(name)) return draft;
  return {
    ...draft,
    today: { ...draft.today, [name]: { ...entryFor(draft, name), ...patch } },
  };
}

/**
 * Skipping clears the answer and un-skipping returns the habit to
 * unanswered, as in the check-in (`features/logs/draft.ts`): an answer the
 * person set aside is not put back in their mouth.
 */
export function toggleSkip(draft: GuideDraft, name: string): GuideDraft {
  if (!chosenHabits(draft).includes(name)) return draft;
  return {
    ...draft,
    today: {
      ...draft.today,
      [name]: { ...emptyEntry(name), skipped: !entryFor(draft, name).skipped },
    },
  };
}

/**
 * What the Today step asks for before the guide can save: at least one habit
 * marked done and at least one skipped, so the first check-in tries both of
 * the answers the real one offers. "Not today" is an answer but not a done
 * one. With a single habit it cannot be both, so only done is asked and
 * `skipped` is `null`.
 */
export function todayRequirements(draft: GuideDraft): {
  done: boolean;
  skipped: boolean | null;
} {
  const entries = chosenHabits(draft).map((name) => entryFor(draft, name));
  return {
    done: entries.some((entry) => entry.done === true),
    skipped: entries.length < 2 ? null : entries.some((entry) => entry.skipped),
  };
}

/** The suggestions no slot holds, which the user can tap to add. */
export function missingSuggestions(
  draft: GuideDraft,
  suggestions: readonly string[],
): string[] {
  const chosen = chosenHabits(draft);
  return suggestions.filter((name) => !includesName(chosen, name));
}
