import { fullSheetDetent } from './sheet-detents';

describe('fullSheetDetent', () => {
  it('stops the sheet at the bottom edge of the status bar', () => {
    expect(fullSheetDetent(40, 800)).toBeCloseTo(0.95);
  });

  it('is the whole height when there is no status bar to clear', () => {
    expect(fullSheetDetent(0, 800)).toBe(1);
  });

  it('falls back to the whole height before the screen has been measured', () => {
    expect(fullSheetDetent(40, 0)).toBe(1);
  });
});
