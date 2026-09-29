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
  toggleDone,
} from './steps';
import { EMPTY_GUIDE, type GuideDraft } from './types';

const draft = (patch: Partial<GuideDraft> = {}): GuideDraft => ({
  ...EMPTY_GUIDE,
  ...patch,
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

  it('needs at least one slot with a habit in it', () => {
    expect(
      canContinue('habits', draft({ goalName: 'Calma', slots: ['', ' '] })),
    ).toBe(false);
    expect(
      canContinue(
        'habits',
        draft({ goalName: 'Calma', slots: ['', 'Respira'] }),
      ),
    ).toBe(true);
  });

  it('saves today with a name and a habit, marked or not', () => {
    expect(
      canContinue('today', draft({ goalName: 'Calma', slots: ['Respira'] })),
    ).toBe(true);
    expect(canContinue('today', draft({ goalName: 'Calma' }))).toBe(false);
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
        doneToday: ['Llega a tiempo'],
        seededFor: 'Trabaja',
      }),
      [],
      3,
    );

    expect(next).toEqual(
      draft({
        goalName: 'Otra',
        slots: ['', '', ''],
        doneToday: [],
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
      draft({ slots: ['Lee', 'Corre'], doneToday: ['Lee', 'Corre'] }),
      0,
      'Lee más',
    );

    expect(next.doneToday).toEqual(['Corre']);
  });
});

describe('clearSlot', () => {
  it('empties the slot and its mark for today', () => {
    const next = clearSlot(
      draft({ slots: ['a', 'b'], doneToday: ['a', 'b'] }),
      0,
    );

    expect(next.slots).toEqual(['', 'b']);
    expect(next.doneToday).toEqual(['b']);
  });
});

describe('hasFreeSlot', () => {
  it('is true while any slot is empty or blank', () => {
    expect(hasFreeSlot(draft({ slots: ['a', ' '] }))).toBe(true);
    expect(hasFreeSlot(draft({ slots: ['a', 'b'] }))).toBe(false);
  });
});

describe('toggleDone', () => {
  it('marks and unmarks a chosen habit', () => {
    const marked = toggleDone(draft({ slots: ['a'] }), 'a');
    expect(marked.doneToday).toEqual(['a']);
    expect(toggleDone(marked, 'a').doneToday).toEqual([]);
  });

  it('ignores a name that is not chosen', () => {
    const current = draft({ slots: ['a'] });
    expect(toggleDone(current, 'b')).toBe(current);
  });
});

describe('missingSuggestions', () => {
  it('lists the suggestions not in any slot', () => {
    expect(
      missingSuggestions(draft({ slots: ['llega a tiempo', ''] }), SUGGESTIONS),
    ).toEqual(['Cumple lo que prometes', 'No hables mal de nadie']);
  });
});
