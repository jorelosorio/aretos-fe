/**
 * The days of one calendar month, laid out for a date picker.
 *
 * Weeks start on Monday, the same week the rest of the app counts in
 * (`features/logs/period.ts`), so the picker and the week strip never
 * disagree about which row a day sits on. Cells outside the month are null
 * rather than the neighbouring month's days: the picker offers one month at
 * a time, and a greyed-out 31 from last month is one more thing to misread.
 *
 * Built from local calendar parts, never from `new Date('YYYY-MM-DD')`, which
 * parses as UTC midnight and lands on the previous day west of Greenwich.
 */

const pad = (value: number) => String(value).padStart(2, '0');

/** The `YYYY-MM` a `YYYY-MM-DD` belongs to. */
export const monthOf = (day: string): string => day.slice(0, 7);

export function shiftMonth(month: string, by: number): string {
  const [year, index] = month.split('-').map(Number);
  const moved = new Date(year, index - 1 + by, 1);
  return `${moved.getFullYear()}-${pad(moved.getMonth() + 1)}`;
}

export function monthGrid(month: string): (string | null)[][] {
  const [year, index] = month.split('-').map(Number);
  const first = new Date(year, index - 1, 1);
  const days = new Date(year, index, 0).getDate();
  const lead = (first.getDay() + 6) % 7;

  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: days }, (_, day) => `${month}-${pad(day + 1)}`),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return Array.from({ length: cells.length / 7 }, (_, week) =>
    cells.slice(week * 7, week * 7 + 7),
  );
}

/**
 * One real day from each column of a month's grid, Monday's column first —
 * what the picker names its weekday header from.
 *
 * Taken from the grid rather than from a hard-coded week so the header can
 * never disagree with the columns beneath it. Every column holds at least
 * one day of the month: even February's 28 days fill each weekday four
 * times, so no column comes back empty.
 */
export function weekdayColumns(grid: (string | null)[][]): string[] {
  return Array.from({ length: 7 }, (_, column) => {
    const day = grid.find((week) => week[column] !== null)?.[column];
    if (day == null) throw new Error(`Column ${column} has no day`);
    return day;
  });
}
