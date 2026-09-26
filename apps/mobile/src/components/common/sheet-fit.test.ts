import { fitResting, resistDrag, snapPoints } from './sheet-fit';

describe('fitResting', () => {
  it('rests the sheet so exactly its chrome, content and inset show', () => {
    expect(
      fitResting({ full: 800, chrome: 90, content: 330, bottom: 34 }),
    ).toBe(346);
  });

  it('opens fully when the content is taller than the sheet can be', () => {
    expect(
      fitResting({ full: 500, chrome: 90, content: 600, bottom: 34 }),
    ).toBe(0);
  });

  it('waits for a measurement before choosing a height', () => {
    expect(
      fitResting({ full: 800, chrome: 0, content: 0, bottom: 34 }),
    ).toBeNull();
  });
});

describe('resistDrag', () => {
  it('follows the finger above the floor', () => {
    expect(resistDrag(300, 200, 80)).toBe(300);
  });

  it('resists past the floor, and stops at the overdrag limit', () => {
    expect(resistDrag(160, 200, 80)).toBe(190);
    expect(resistDrag(-400, 200, 80)).toBe(120);
  });

  it('treats a sheet that may expand as floored at fully open', () => {
    expect(resistDrag(-40, 0, 80)).toBe(-10);
  });
});

describe('snapPoints', () => {
  it('offers full height only when the sheet may expand', () => {
    expect(snapPoints(300, 700, true)).toEqual([0, 300, 700]);
    expect(snapPoints(300, 700, false)).toEqual([300, 700]);
  });
});
