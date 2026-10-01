import { formatWait } from './use-resend-countdown';

describe('formatWait', () => {
  it('shows minutes and padded seconds', () => {
    expect(formatWait(900)).toBe('15:00');
    expect(formatWait(605)).toBe('10:05');
    expect(formatWait(59)).toBe('0:59');
  });

  it('never goes below zero', () => {
    expect(formatWait(0)).toBe('0:00');
    expect(formatWait(-3)).toBe('0:00');
  });

  it('rounds a partial second up, so zero means ready', () => {
    expect(formatWait(0.4)).toBe('0:01');
  });
});
