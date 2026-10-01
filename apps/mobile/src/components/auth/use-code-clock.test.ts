import { formatWait, fromSentParams, toSentParams } from './use-code-clock';

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

describe('sent params', () => {
  it('survive the round trip through a route', () => {
    const sent = { expires_in: 900, resend_after: 900 };
    expect(fromSentParams(toSentParams(sent))).toEqual(sent);
  });

  it('are absent when a screen was reached without a send', () => {
    expect(fromSentParams({})).toBeNull();
    expect(fromSentParams({ expiresIn: '900' })).toBeNull();
  });

  it('are ignored when they will not parse', () => {
    expect(fromSentParams({ expiresIn: 'soon', resendAfter: '900' })).toBeNull();
  });
});
