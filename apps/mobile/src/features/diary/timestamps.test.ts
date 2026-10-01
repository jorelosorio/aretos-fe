import { nowTimestamp, toTimestamp } from './timestamps';

describe('toTimestamp', () => {
  it('pads a fraction Go trimmed, so text sorts as time', () => {
    expect(toTimestamp('2026-10-01T08:15:00.12Z')).toBe(
      '2026-10-01T08:15:00.120000Z',
    );
    expect(toTimestamp('2026-10-01T08:15:00Z')).toBe(
      '2026-10-01T08:15:00.000000Z',
    );
    expect(
      toTimestamp('2026-10-01T08:15:00.12Z') <
        toTimestamp('2026-10-01T08:15:00.9Z'),
    ).toBe(true);
  });

  it('keeps microseconds a Date would round away', () => {
    expect(toTimestamp('2026-10-01T08:15:00.123456Z')).toBe(
      '2026-10-01T08:15:00.123456Z',
    );
  });

  it('moves an offset to UTC', () => {
    expect(toTimestamp('2026-10-01T03:15:00.5-05:00')).toBe(
      '2026-10-01T08:15:00.500000Z',
    );
  });

  it('refuses what is not a timestamp', () => {
    expect(() => toTimestamp('yesterday')).toThrow();
  });
});

describe('nowTimestamp', () => {
  it('has the stored shape', () => {
    expect(nowTimestamp(new Date('2026-10-01T08:15:00.123Z'))).toBe(
      '2026-10-01T08:15:00.123000Z',
    );
  });
});
