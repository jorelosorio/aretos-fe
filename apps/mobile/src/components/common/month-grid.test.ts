import { monthGrid, monthOf, shiftMonth } from './month-grid';

describe('monthGrid', () => {
  it('lays a month out in Monday-first weeks, padding the edges', () => {
    const weeks = monthGrid('2026-09');

    expect(weeks).toHaveLength(5);
    expect(weeks[0]).toEqual([
      null,
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
      '2026-09-05',
      '2026-09-06',
    ]);
    expect(weeks[4]).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      null,
      null,
      null,
      null,
    ]);
  });

  it('starts on the first cell when the month starts on a Monday', () => {
    expect(monthGrid('2026-06')[0][0]).toBe('2026-06-01');
  });
});

describe('shiftMonth', () => {
  it('crosses year boundaries both ways', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
  });
});

describe('monthOf', () => {
  it('is the YYYY-MM a day belongs to', () => {
    expect(monthOf('2026-09-24')).toBe('2026-09');
  });
});
