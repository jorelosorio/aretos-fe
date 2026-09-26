import { writtenOnEntryDay } from './diary-date';

describe('writtenOnEntryDay', () => {
  const at = (day: number, hour: number) =>
    new Date(2026, 8, day, hour, 50).toISOString();

  it('is true when the note was written on its own day', () => {
    expect(writtenOnEntryDay(at(24, 14), '2026-09-24')).toBe(true);
  });

  it('is false for a note dated to another day', () => {
    expect(writtenOnEntryDay(at(25, 9), '2026-09-24')).toBe(false);
  });
});
