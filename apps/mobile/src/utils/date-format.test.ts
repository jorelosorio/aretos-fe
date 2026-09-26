import { dateFormat } from './date-format';

describe('dateFormat', () => {
  it('hands back the same formatter for the same locale and options', () => {
    const a = dateFormat('es', { day: 'numeric', month: 'short' });
    const b = dateFormat('es', { month: 'short', day: 'numeric' });

    expect(a).toBe(b);
  });

  it('keeps different locales and options apart', () => {
    const short = dateFormat('es', { month: 'short' });

    expect(dateFormat('en', { month: 'short' })).not.toBe(short);
    expect(dateFormat('es', { month: 'long' })).not.toBe(short);
  });

  it('formats exactly as Intl does', () => {
    const date = new Date(2026, 8, 24);
    const options = { weekday: 'short', day: 'numeric' } as const;

    expect(dateFormat('es', options).format(date)).toBe(
      new Intl.DateTimeFormat('es', options).format(date),
    );
  });
});
