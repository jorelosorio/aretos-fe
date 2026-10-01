/**
 * The welcome screen's animated ground, drawn by a Skia runtime shader.
 *
 * Only pure pieces live here — the shader source and the palette maths — so
 * they can be tested without a GPU. `aurora.tsx` compiles the shader and
 * drives it.
 */

export type Rgb = [number, number, number];

/** The shader time the single still frame is drawn at under Reduce Motion. */
export const STILL_TIME = 40;

/**
 * One display frame of the aurora's throttled clock: gathers the real time
 * since the previous frame and says whether enough has passed to draw.
 *
 * Driven by frame deltas rather than time since the callback started,
 * because Reanimated restarts that count whenever the callback is paused —
 * which happens on every trip to the background and every system sheet —
 * and a throttle compared against it would stall for as long as the aurora
 * had run before. Carrying the remainder keeps the average at the target
 * rate even when frames arrive a hair early, and a long gap produces one
 * tick rather than a burst.
 */
export function stepClock(
  pending: number,
  delta: number,
  interval: number,
): { pending: number; tick: boolean } {
  'worklet';
  const gathered = pending + delta;
  if (gathered < interval) return { pending: gathered, tick: false };
  return { pending: gathered % interval, tick: true };
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function hslToRgb(h: number, s: number, l: number): Rgb {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

/**
 * Reads the colour strings the theme resolves to. Tamagui hands the palette
 * steps back as `hsla(…)` and the named roles as hex, so both have to parse;
 * anything else is refused rather than guessed, and the aurora then simply
 * does not draw.
 */
export function parseColor(value: string): Rgb | null {
  const text = value.trim().toLowerCase();

  const hex = text.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex) {
    const digits = hex[1];
    const size = digits.length === 3 ? 1 : 2;
    const channel = (index: number) => {
      const raw = digits.slice(index * size, index * size + size);
      return parseInt(size === 1 ? raw + raw : raw, 16) / 255;
    };
    return [channel(0), channel(1), channel(2)];
  }

  const rgb = text.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if (rgb) {
    return [
      clamp01(Number(rgb[1]) / 255),
      clamp01(Number(rgb[2]) / 255),
      clamp01(Number(rgb[3]) / 255),
    ];
  }

  const hsl = text.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/);
  if (hsl) {
    return hslToRgb(Number(hsl[1]), Number(hsl[2]) / 100, Number(hsl[3]) / 100);
  }

  return null;
}

export function luminance([r, g, b]: Rgb): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Scales a tint's distance from the ground without leaving gamut. */
export function amplify(tint: Rgb, ground: Rgb, factor: number): Rgb {
  return tint.map((channel, i) =>
    clamp01(ground[i] + (channel - ground[i]) * factor),
  ) as Rgb;
}

/**
 * How far each mode's tints sit from the ground, as a share of the colour the
 * aurora is given for them.
 *
 * Dark is given the deco tints, a whisper off its near-black ground, and
 * pushes them further out: the clouds are lighter than the page, so the eye
 * follows them easily.
 *
 * Light is given the vivid tints instead and takes most of the way
 * to them. Pushing the pastel deco tints out, as dark does, left every cloud
 * as light as the cream it drifts over: the page read as tinted peach and
 * green, while the motion — carried by lightness, not hue — disappeared. A
 * share of the vivid colours gives clouds a step deeper than the cream and
 * clearly apart from one another, with the cream still showing between them.
 */
const LIGHT_SHARE = 0.9;
const DARK_BOOST = 1.7;

/**
 * The shader's palette as one flat list — ground, ember, moss, honey, three
 * channels each — which is the shape the UI-thread easing works on.
 */
export function auroraPalette(colors: {
  ground: string;
  ember: string;
  moss: string;
  honey: string;
}): number[] | null {
  const ground = parseColor(colors.ground);
  const ember = parseColor(colors.ember);
  const moss = parseColor(colors.moss);
  const honey = parseColor(colors.honey);
  if (!ground || !ember || !moss || !honey) return null;

  const boost = luminance(ground) > 0.5 ? LIGHT_SHARE : DARK_BOOST;
  return [
    ...ground,
    ...amplify(ember, ground, boost),
    ...amplify(moss, ground, boost),
    ...amplify(honey, ground, boost),
  ];
}

/**
 * The aurora's fragment shader: a two-stage domain warp
 * (fbm fed through fbm), a fine octave that perturbs where each tint starts,
 * three tint layers at descending strength, a vignette pulling the centre
 * back to the ground so copy sits on quiet air, and a two-LSB dither against
 * banding. Skia's origin is top-left, so `uv.y` is flipped to run bottom to
 * top; the vignette's centre at y 0.62 then sits a little above the middle of
 * the screen.
 *
 * `u_form` runs 0 to 1 as the aurora forms when it first appears. At 0 it
 * draws the bare ground — so the frames Skia spends creating its surface are
 * indistinguishable from the page already there — and at 1 the aurora is
 * exactly what it is without the uniform. Between, a tide rises from the
 * bottom across the whole width, its edge torn by the same noise the clouds
 * are made of so it reaches ahead where they are dense, and behind it the
 * clouds condense rather than fade in: each tint's threshold starts raised, so
 * only the densest cores show first and then thicken out to their full
 * extent, the way a cloud forms rather than the way a layer is revealed.
 */
export const AURORA_SKSL = `
uniform float2 u_res;
uniform float u_time;
uniform float3 u_bg;
uniform float3 u_ember;
uniform float3 u_moss;
uniform float3 u_honey;
uniform float u_form;

float hash(float2 p) {
  return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453123);
}

float noise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  float2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + float2(1.0, 0.0)), u.x),
    mix(hash(i + float2(0.0, 1.0)), hash(i + float2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(float2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + float2(17.0);
    a *= 0.5;
  }
  return v;
}

half4 main(float2 xy) {
  float2 uv = float2(xy.x / u_res.x, 1.0 - xy.y / u_res.y);
  float2 p = uv;
  p.x *= u_res.x / u_res.y;

  float t = u_time;

  float2 q = float2(
    fbm(p * 1.1 + t * 0.03),
    fbm(p * 1.1 - t * 0.02 + 5.2)
  );
  float2 r = float2(
    fbm(p * 1.3 + q * 1.6 + t * 0.02),
    fbm(p * 1.3 + q * 1.6 - t * 0.015 + 8.7)
  );
  float n = fbm(p * 1.2 + r * 1.8);
  float detail = fbm(p * 6.5 + r * 1.2);

  float front = u_form * 2.05 - 0.2;
  float edge = uv.x - 0.5;
  float reach = uv.y + edge * edge * 0.6 + (n - 0.5) * 0.8 + (detail - 0.5) * 0.25;
  float formed = 1.0 - smoothstep(front - 0.32, front, reach);
  formed *= smoothstep(0.0, 0.08, u_form);
  formed = mix(formed, 1.0, step(1.0, u_form));
  float lift = (1.0 - formed) * 0.3;

  float3 col = u_bg;
  float grit = (detail - 0.5) * 0.09;
  col = mix(col, u_ember, smoothstep(0.32 + lift, 0.70 + lift, n + grit) * 0.72 * formed);
  col = mix(col, u_moss, smoothstep(0.36 + lift, 0.76 + lift, q.y + grit) * 0.62 * formed);
  col = mix(col, u_honey, smoothstep(0.40 + lift, 0.82 + lift, r.x + grit) * 0.50 * formed);

  float d = distance(uv, float2(0.5, 0.62));
  col = mix(col, u_bg, smoothstep(0.34, 0.05, d) * 0.42);

  col += (hash(xy) - 0.5) * (2.0 / 255.0);
  return half4(half3(col), 1.0);
}
`;
