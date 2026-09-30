import {
  canContinue,
  chosenHabits,
  clearSlot,
  editSlot,
  enterHabits,
  fillSlot,
  habitCap,
  hasFreeSlot,
  missingSuggestions,
  nextStep,
  previousStep,
  entryFor,
  setEntry,
  todayRequirements,
  toggleSkip,
} from './steps';
import { EMPTY_GUIDE, type GuideDraft } from './types';

const draft = (patch: Partial<GuideDraft> = {}): GuideDraft => ({
  ...EMPTY_GUIDE,
  ...patch,
});

const done = (habitId: string) => ({
  habitId,
  skipped: false,
  done: true,
  amount: null,
});

const SUGGESTIONS = [
  'Llega a tiempo',
  'Cumple lo que prometes',
  'No hables mal de nadie',
];

describe('step order', () => {
  it('moves forward through every step and stays on done', () => {
    expect(nextStep('goal')).toBe('habits');
    expect(nextStep('habits')).toBe('today');
    expect(nextStep('today')).toBe('saving');
    expect(nextStep('saving')).toBe('done');
    expect(nextStep('done')).toBe('done');
  });

  it('goes back only between input steps', () => {
    expect(previousStep('goal')).toBeNull();
    expect(previousStep('habits')).toBe('goal');
    expect(previousStep('today')).toBe('habits');
    expect(previousStep('saving')).toBeNull();
    expect(previousStep('done')).toBeNull();
  });
});

describe('canContinue', () => {
  it('needs a goal name that is not only spaces', () => {
    expect(canContinue('goal', draft())).toBe(false);
    expect(canContinue('goal', draft({ goalName: '   ' }))).toBe(false);
    expect(canContinue('goal', draft({ goalName: 'Calma' }))).toBe(true);
  });

  it('needs every slot to hold a habit of its own', () => {
    const habits = (slots: string[]) =>
      canContinue('habits', draft({ goalName: 'Calma', slots }));

    expect(habits(['', ' ', ''])).toBe(false);
    expect(habits(['Respira', 'Lee', ''])).toBe(false);
    expect(habits(['Respira', ' respira ', 'Lee'])).toBe(false);
    expect(habits(['Respira', 'Lee', 'Corre'])).toBe(true);
  });

  it('needs only the slots the plan allows', () => {
    expect(
      canContinue('habits', draft({ goalName: 'Calma', slots: ['Respira'] })),
    ).toBe(true);
    expect(canContinue('habits', draft({ goalName: 'Calma', slots: [] }))).toBe(
      false,
    );
  });

  it('saves today once one habit is done and another skipped', () => {
    const three = draft({ goalName: 'Calma', slots: ['a', 'b', 'c'] });
    const marked = setEntry(three, 'a', { done: true });

    expect(canContinue('today', three)).toBe(false);
    expect(canContinue('today', marked)).toBe(false);
    expect(canContinue('today', toggleSkip(three, 'b'))).toBe(false);
    expect(canContinue('today', toggleSkip(marked, 'b'))).toBe(true);
  });

  it('does not count not today as done', () => {
    const three = draft({ goalName: 'Calma', slots: ['a', 'b'] });
    const answered = toggleSkip(setEntry(three, 'a', { done: false }), 'b');

    expect(canContinue('today', answered)).toBe(false);
  });

  it('asks only for a done habit when there is a single one', () => {
    const one = draft({ goalName: 'Calma', slots: ['a'] });

    expect(todayRequirements(one)).toEqual({ done: false, skipped: null });
    expect(canContinue('today', setEntry(one, 'a', { done: true }))).toBe(true);
  });

  it('never continues from saving or done, which have their own buttons', () => {
    const ready = draft({ goalName: 'Calma', slots: ['Respira'] });
    expect(canContinue('saving', ready)).toBe(false);
    expect(canContinue('done', ready)).toBe(false);
  });
});

describe('habitCap', () => {
  it('is three without a plan limit or with room to spare', () => {
    expect(habitCap(null)).toBe(3);
    expect(habitCap(10)).toBe(3);
  });

  it('follows a smaller plan allowance and never goes negative', () => {
    expect(habitCap(2)).toBe(2);
    expect(habitCap(0)).toBe(0);
    expect(habitCap(-1)).toBe(0);
  });
});

describe('chosenHabits', () => {
  it('is the filled slots, trimmed, without repeats', () => {
    expect(
      chosenHabits(draft({ slots: [' Respira ', '', 'respira', 'Lee'] })),
    ).toEqual(['Respira', 'Lee']);
  });
});

describe('enterHabits', () => {
  it('fills the slots from the suggestions on first entry', () => {
    const next = enterHabits(
      draft({ goalName: ' Trabaja con excelencia ' }),
      SUGGESTIONS,
      3,
    );

    expect(next.slots).toEqual(SUGGESTIONS);
    expect(next.seededFor).toBe('Trabaja con excelencia');
  });

  it('opens as many slots as the cap, filling no more than it', () => {
    expect(
      enterHabits(draft({ goalName: 'Trabaja' }), SUGGESTIONS, 1).slots,
    ).toEqual(['Llega a tiempo']);
    expect(enterHabits(draft({ goalName: 'Mía' }), [], 3).slots).toEqual([
      '',
      '',
      '',
    ]);
  });

  it('keeps the user edits when the name has not changed', () => {
    const edited = draft({
      goalName: 'Trabaja ',
      slots: ['Mi hábito', '', ''],
      seededFor: 'Trabaja',
    });

    expect(enterHabits(edited, SUGGESTIONS, 3)).toBe(edited);
  });

  it('starts again after the name changed', () => {
    const next = enterHabits(
      draft({
        goalName: 'Otra',
        slots: ['Llega a tiempo', '', ''],
        today: { 'Llega a tiempo': done('Llega a tiempo') },
        seededFor: 'Trabaja',
      }),
      [],
      3,
    );

    expect(next).toEqual(
      draft({
        goalName: 'Otra',
        slots: ['', '', ''],
        today: {},
        seededFor: 'Otra',
      }),
    );
  });
});

describe('fillSlot', () => {
  it('puts a suggestion in the first free slot', () => {
    expect(fillSlot(draft({ slots: ['a', '', ''] }), 'Respira').slots).toEqual([
      'a',
      'Respira',
      '',
    ]);
  });

  it('ignores a name already chosen, whatever its case', () => {
    const current = draft({ slots: ['Respira', ''] });
    expect(fillSlot(current, ' respira ')).toBe(current);
  });

  it('ignores it when every slot is taken', () => {
    const current = draft({ slots: ['a', 'b'] });
    expect(fillSlot(current, 'c')).toBe(current);
  });
});

describe('editSlot', () => {
  it('writes what is typed into that slot', () => {
    expect(editSlot(draft({ slots: ['', ''] }), 1, 'Lee').slots).toEqual([
      '',
      'Lee',
    ]);
  });

  it('drops the old name from today once it is no longer chosen', () => {
    const next = editSlot(
      draft({
        slots: ['Lee', 'Corre'],
        today: { Lee: done('Lee'), Corre: done('Corre') },
      }),
      0,
      'Lee más',
    );

    expect(Object.keys(next.today)).toEqual(['Corre']);
  });
});

describe('clearSlot', () => {
  it('empties the slot and its mark for today', () => {
    const next = clearSlot(
      draft({ slots: ['a', 'b'], today: { a: done('a'), b: done('b') } }),
      0,
    );

    expect(next.slots).toEqual(['', 'b']);
    expect(Object.keys(next.today)).toEqual(['b']);
  });
});

describe('hasFreeSlot', () => {
  it('is true while any slot is empty or blank', () => {
    expect(hasFreeSlot(draft({ slots: ['a', ' '] }))).toBe(true);
    expect(hasFreeSlot(draft({ slots: ['a', 'b'] }))).toBe(false);
  });
});

describe('todayRequirements', () => {
  it('reports each requirement as it is met', () => {
    const three = draft({ slots: ['a', 'b', 'c'] });
    expect(todayRequirements(three)).toEqual({ done: false, skipped: false });
    expect(
      todayRequirements(toggleSkip(setEntry(three, 'a', { done: true }), 'c')),
    ).toEqual({ done: true, skipped: true });
  });
});

describe('answers for today', () => {
  it('starts every chosen habit unanswered', () => {
    expect(entryFor(draft({ slots: ['a'] }), 'a')).toEqual({
      habitId: 'a',
      skipped: false,
      done: null,
      amount: null,
    });
  });

  it('records done and not today alike', () => {
    const marked = setEntry(draft({ slots: ['a', 'b'] }), 'a', { done: true });
    const both = setEntry(marked, 'b', { done: false });

    expect(entryFor(both, 'a').done).toBe(true);
    expect(entryFor(both, 'b').done).toBe(false);
  });

  it('skips by clearing the answer, and un-skips back to unanswered', () => {
    const answered = setEntry(draft({ slots: ['a'] }), 'a', { done: true });
    const skipped = toggleSkip(answered, 'a');

    expect(entryFor(skipped, 'a')).toMatchObject({ skipped: true, done: null });
    expect(entryFor(toggleSkip(skipped, 'a'), 'a')).toMatchObject({
      skipped: false,
      done: null,
    });
  });

  it('ignores a name that is not chosen', () => {
    const current = draft({ slots: ['a'] });
    expect(setEntry(current, 'b', { done: true })).toBe(current);
    expect(toggleSkip(current, 'b')).toBe(current);
  });
});

describe('missingSuggestions', () => {
  it('lists the suggestions not in any slot', () => {
    expect(
      missingSuggestions(draft({ slots: ['llega a tiempo', ''] }), SUGGESTIONS),
    ).toEqual(['Cumple lo que prometes', 'No hables mal de nadie']);
  });
});
