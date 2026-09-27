import { fromDateKey } from './date-key';

describe('fromDateKey', () => {
  it('builds local midnight of the same calendar day', () => {
    const today = new Date();
    const key = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');

    const date = fromDateKey(key);

    expect(date.getFullYear()).toBe(today.getFullYear());
    expect(date.getMonth()).toBe(today.getMonth());
    expect(date.getDate()).toBe(today.getDate());
    expect(date.getHours()).toBe(0);
  });

  it('keeps the first of a month in that month', () => {
    const date = fromDateKey(`${new Date().getFullYear()}-03-01`);

    expect(date.getMonth()).toBe(2);
    expect(date.getDate()).toBe(1);
  });
});
