import {
  amplify,
  auroraPalette,
  luminance,
  parseColor,
  stepClock,
} from './aurora-shader';

describe('stepClock', () => {
  const interval = 1000 / 30;

  const run = (deltas: number[]) => {
    let pending = 0;
    let ticks = 0;
    for (const delta of deltas) {
      const step = stepClock(pending, delta, interval);
      pending = step.pending;
      if (step.tick) ticks += 1;
    }
    return ticks;
  };

  it('keeps ticking straight after a resume, whatever ran before the pause', () => {
    expect(run([0, 16.7, 16.7, 16.7, 16.7])).toBe(2);
  });

  it('holds the target rate on a 60Hz display despite frame jitter', () => {
    expect(run(Array.from({ length: 60 }, () => 16.66))).toBe(29);
  });

  it('ticks once, not in a burst, after a long frame', () => {
    const step = stepClock(0, 5000, interval);
    expect(step.tick).toBe(true);
    expect(step.pending).toBeLessThan(interval);
  });
});

const close = (actual: readonly number[] | null, expected: number[]) => {
  expect(actual).not.toBeNull();
  (actual as number[]).forEach((value, i) =>
    expect(value).toBeCloseTo(expected[i], 2),
  );
};

describe('parseColor', () => {
  it('reads six- and three-digit hex', () => {
    close(parseColor('#ffdcc7'), [1, 220 / 255, 199 / 255]);
    close(parseColor('#fff'), [1, 1, 1]);
  });

  it('reads the hsla strings Tamagui resolves the background to', () => {
    close(parseColor('hsla(37, 57%, 93%, 1)'), [0.97, 0.94, 0.89]);
    close(parseColor('hsla(27, 23%, 9%, 1)'), [0.11, 0.09, 0.07]);
  });

  it('reads rgb and rgba', () => {
    close(parseColor('rgba(245, 234, 222, 0.12)'), [
      245 / 255,
      234 / 255,
      222 / 255,
    ]);
  });

  it('refuses what it cannot read instead of guessing', () => {
    expect(parseColor('$background')).toBeNull();
    expect(parseColor('')).toBeNull();
  });
});

describe('amplify', () => {
  it('pushes a tint away from the ground and clamps to gamut', () => {
    close(amplify([0.9, 0.5, 0.5], [0.5, 0.5, 0.5], 2), [1, 0.5, 0.5]);
    close(amplify([0.4, 0.5, 0.5], [0.5, 0.5, 0.5], 2), [0.3, 0.5, 0.5]);
  });
});

describe('auroraPalette', () => {
  it('boosts tints more on a light ground than a dark one', () => {
    const light = auroraPalette({
      ground: '#f7efe2',
      ember: '#ffdcc7',
      moss: '#e1edc9',
      honey: '#fbe7bb',
    });
    const dark = auroraPalette({
      ground: '#1d1712',
      ember: '#472a1e',
      moss: '#2e3d24',
      honey: '#4a3616',
    });
    expect(light).toHaveLength(12);
    expect(dark).toHaveLength(12);
    expect(luminance([light![0], light![1], light![2]])).toBeGreaterThan(0.5);
    const lightShift = Math.abs(light![5] - 199 / 255);
    const darkShift = Math.abs(dark![5] - 0x1e / 255);
    expect(lightShift).toBeGreaterThan(darkShift);
  });

  it('returns null when any colour is unreadable', () => {
    expect(
      auroraPalette({
        ground: '$bg',
        ember: '#fff',
        moss: '#fff',
        honey: '#fff',
      }),
    ).toBeNull();
  });
});
