import { partOfDay } from './part-of-day';

const at = (hour: number) => new Date(2026, 8, 26, hour, 30);

describe('partOfDay', () => {
  it('greets the morning from five until noon', () => {
    expect(partOfDay(at(5))).toBe('morning');
    expect(partOfDay(at(11))).toBe('morning');
  });

  it('keeps the afternoon until eight in the evening', () => {
    expect(partOfDay(at(12))).toBe('afternoon');
    expect(partOfDay(at(19))).toBe('afternoon');
  });

  it('calls the rest of the night evening, early hours included', () => {
    expect(partOfDay(at(20))).toBe('evening');
    expect(partOfDay(at(0))).toBe('evening');
    expect(partOfDay(at(4))).toBe('evening');
  });
});
