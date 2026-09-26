import { noteChanged, type NoteValue } from './note-draft';

const initial: NoteValue = {
  body: 'Walked to work',
  tags: ['Health'],
  entryDate: '2026-09-24',
};

describe('noteChanged', () => {
  it('is false for the value it started from', () => {
    expect(noteChanged({ ...initial }, initial)).toBe(false);
  });

  it('ignores a tag that only differs in case', () => {
    expect(noteChanged({ ...initial, tags: ['health'] }, initial)).toBe(false);
  });

  it('sees a new body, a new tag and a new day', () => {
    expect(noteChanged({ ...initial, body: 'Ran' }, initial)).toBe(true);
    expect(noteChanged({ ...initial, tags: ['Health', 'Work'] }, initial)).toBe(
      true,
    );
    expect(noteChanged({ ...initial, entryDate: '2026-09-23' }, initial)).toBe(
      true,
    );
  });
});
