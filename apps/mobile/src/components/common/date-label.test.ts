import { weekMonthLabel, weekdayInitial, weekdayLabel } from './date-label';

const startsUpper = /^\p{Lu}/u;

describe('standalone date labels', () => {
  it('start with a capital in Spanish, which writes them in lower case', () => {
    expect(weekdayLabel('2026-09-24', 'es')).toMatch(startsUpper);
    expect(weekdayInitial('2026-09-24', 'es')).toMatch(startsUpper);
    expect(weekMonthLabel('2026-09-21', 'es')).toMatch(startsUpper);
  });
});
