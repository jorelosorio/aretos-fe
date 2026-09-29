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
  /** How far a palette tint sits from the ground, as a share of the source. */
  const share = (palette: number[], channel: number, source: string) => {
    const ground = palette[channel % 3];
    const target =
      parseInt(source.slice(1 + (channel % 3) * 2, 3 + (channel % 3) * 2), 16) /
      255;
    return (palette[channel] - ground) / (target - ground);
  };

  it('on a light ground, takes only part of the way to each vivid tint', () => {
    const light = auroraPalette({
      ground: '#f7efe2',
      ember: '#f89a5c',
      moss: '#8fbf5a',
      honey: '#f0b23c',
    });
    expect(light).toHaveLength(12);
    expect(luminance([light![0], light![1], light![2]])).toBeGreaterThan(0.5);
    for (const [channel, source] of [
      [4, '#f89a5c'],
      [6, '#8fbf5a'],
      [11, '#f0b23c'],
    ] as const) {
      expect(share(light!, channel, source)).toBeGreaterThan(0.15);
      expect(share(light!, channel, source)).toBeLessThan(0.5);
    }
  });

  it('on a dark ground, pushes each tint further from the ground', () => {
    const dark = auroraPalette({
      ground: '#1d1712',
      ember: '#472a1e',
      moss: '#2e3d24',
      honey: '#4a3616',
    });
    expect(dark).toHaveLength(12);
    expect(share(dark!, 3, '#472a1e')).toBeGreaterThan(1);
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
