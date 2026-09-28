import { useEffect, useMemo, type ReactNode } from 'react';
import {
  Canvas,
  Group,
  Paint,
  Picture,
  rect,
  vec,
  type Transforms3d,
} from '@shopify/react-native-skia';
import { useIsFocused } from 'expo-router';
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import {
  ART_EXTENT,
  VIEWBOX,
  type ArtBounds,
  type ArtLayer,
  type FadingLayer,
} from './art-layer';
import { artPicture } from './art-picture';

const TAP_ANGLE = 4;
const TAP_OUT = 150;
const TAP_BACK = 170;
const TAP_REST = 1600;

const FLOAT_RANGE = 6;
const FLOAT_TILT = 3;
const FLOAT_TIMES = [2200, 2600, 2400];

const TWINKLE_TIMES = [1300, 1700, 1500, 1900, 1400, 1800];
const TWINKLE_SCALE = 0.55;
const TWINKLE_OPACITY = 0.45;

const PULSE_TIME = 650;
const PULSE_OPACITY = 0.3;

const GROW_TIME = 1500;
const GROW_STAGGER = 350;
const GROW_LOW = 0.35;

const SWEEP_ANGLE = 4;
const SWEEP_TIME = 1800;

const WRITE_TIME = 1800;
const WRITE_HOLD = 350;
const WRITE_RETURN = 450;
const WRITE_WAVES = 7;
const WRITE_WIGGLE = 1.4;
const WRITE_LIFT = 3;

const EASE = Easing.inOut(Easing.sin);
const DEGREE = Math.PI / 180;
const CLIP_MARGIN = 2;

type Point = readonly [number, number];
type Motion = { still: boolean };
type Transform = SharedValue<Transforms3d>;

export function useArtMotion(): Motion {
  const reduced = useReducedMotion();
  const focused = useIsFocused();

  return { still: reduced || !focused };
}

export function ArtFrame({
  size,
  bounds,
  children,
}: {
  size: number;
  bounds: ArtBounds;
  children: ReactNode;
}) {
  const [left, top, right, bottom] = bounds;
  const fit =
    (size / VIEWBOX) * (ART_EXTENT / Math.max(right - left, bottom - top));
  const transform: Transforms3d = [
    { translateX: size / 2 },
    { translateY: size / 2 },
    { scale: fit },
    { translateX: -(left + right) / 2 },
    { translateY: -(top + bottom) / 2 },
  ];

  return (
    <Canvas
      style={{ width: size, height: size }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Group transform={transform}>{children}</Group>
    </Canvas>
  );
}

export function Layer({ xml }: { xml: string }) {
  const picture = useMemo(() => artPicture(xml), [xml]);

  return <Picture picture={picture} />;
}

function Moved({
  xml,
  origin,
  transform,
}: {
  xml: string;
  origin?: Point;
  transform: Transform;
}) {
  return (
    <Group origin={origin && vec(origin[0], origin[1])} transform={transform}>
      <Layer xml={xml} />
    </Group>
  );
}

function Faded({
  layer,
  opacity,
  transform,
}: {
  layer: FadingLayer;
  opacity: SharedValue<number>;
  transform?: Transform;
}) {
  const [left, top, right, bottom] = layer.bounds;
  const clip = rect(
    left - CLIP_MARGIN,
    top - CLIP_MARGIN,
    right - left + CLIP_MARGIN * 2,
    bottom - top + CLIP_MARGIN * 2,
  );

  return (
    <Group
      origin={vec(layer.center[0], layer.center[1])}
      transform={transform}
      clip={clip}
    >
      <Group layer={<Paint opacity={opacity} />}>
        <Layer xml={layer.xml} />
      </Group>
    </Group>
  );
}

export function TappingHand({
  pencil,
  forearm,
  hand,
  wrist,
  still,
}: Motion & {
  pencil: string;
  forearm: string;
  hand: string;
  wrist: Point;
}) {
  const angle = useSharedValue(0);

  useEffect(() => {
    if (still) return;

    const lift = () =>
      withTiming(TAP_ANGLE, {
        duration: TAP_OUT,
        easing: Easing.out(Easing.quad),
      });
    const touch = () =>
      withTiming(0, { duration: TAP_BACK, easing: Easing.in(Easing.quad) });

    angle.set(
      withRepeat(
        withSequence(withDelay(TAP_REST, lift()), touch(), lift(), touch()),
        -1,
      ),
    );

    return () => {
      cancelAnimation(angle);
      angle.set(0);
    };
  }, [angle, still]);

  const turn = useDerivedValue<Transforms3d>(() => [
    { rotate: angle.get() * DEGREE },
  ]);

  return (
    <>
      <Moved xml={pencil} origin={wrist} transform={turn} />
      <Layer xml={forearm} />
      <Moved xml={hand} origin={wrist} transform={turn} />
    </>
  );
}

export function Sweep({
  xml,
  pivot,
  still,
}: Motion & { xml: string; pivot: Point }) {
  const angle = useSharedValue(0);

  useEffect(() => {
    if (still) return;

    angle.set(
      withSequence(
        withTiming(-SWEEP_ANGLE, { duration: SWEEP_TIME / 2, easing: EASE }),
        withRepeat(
          withTiming(SWEEP_ANGLE, { duration: SWEEP_TIME, easing: EASE }),
          -1,
          true,
        ),
      ),
    );

    return () => {
      cancelAnimation(angle);
      angle.set(0);
    };
  }, [angle, still]);

  const turn = useDerivedValue<Transforms3d>(() => [
    { rotate: angle.get() * DEGREE },
  ]);

  return <Moved xml={xml} origin={pivot} transform={turn} />;
}

export function Writing({
  arm,
  hand,
  ink,
  anchor,
  reach,
  stroke,
  still,
}: Motion & {
  arm: string;
  hand: string;
  ink: FadingLayer;
  anchor: Point;
  reach: number;
  stroke: Point;
}) {
  const progress = useSharedValue(1);
  const [runX, runY] = stroke;

  useEffect(() => {
    if (still) return;

    progress.set(
      withSequence(
        withTiming(0, { duration: 0 }),
        withRepeat(
          withSequence(
            withTiming(1, { duration: WRITE_TIME, easing: Easing.linear }),
            withDelay(
              WRITE_HOLD,
              withTiming(2, { duration: WRITE_RETURN, easing: EASE }),
            ),
            withTiming(0, { duration: 0 }),
          ),
          -1,
        ),
      ),
    );

    return () => {
      cancelAnimation(progress);
      progress.set(1);
    };
  }, [progress, still]);

  const pen = useDerivedValue(() => {
    const p = progress.get();
    const along = p <= 1 ? p : 2 - p;
    const wiggle =
      p < 1 ? Math.sin(p * Math.PI * 2 * WRITE_WAVES) * WRITE_WIGGLE : 0;
    const lift = p > 1 ? Math.sin((p - 1) * Math.PI) * WRITE_LIFT : 0;

    return { x: along * runX, y: along * runY + wiggle - lift };
  });

  const write = useDerivedValue<Transforms3d>(() => [
    { translateX: pen.get().x },
    { translateY: pen.get().y },
  ]);

  const stretch = useDerivedValue<Transforms3d>(() => {
    const widen = 1 + pen.get().x / reach;
    const shear = pen.get().y / reach;

    return [
      {
        matrix: [widen, 0, 0, 0, shear, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      },
    ];
  });

  const fill = useDerivedValue<Transforms3d>(() => {
    const p = progress.get();

    return [{ scaleX: p <= 1 ? Math.max(p, 0.001) : 1 }];
  });

  const inked = useDerivedValue(() => {
    const p = progress.get();

    return p <= 1 ? 1 : Math.max(0, 1 - (p - 1) * 1.6);
  });

  return (
    <>
      <Faded layer={ink} opacity={inked} transform={fill} />
      <Moved xml={arm} origin={anchor} transform={stretch} />
      <Moved xml={hand} transform={write} />
    </>
  );
}

export function Float({
  layer,
  index,
  still,
}: Motion & { layer: ArtLayer; index: number }) {
  const phase = useSharedValue(0.5);

  useEffect(() => {
    if (still) return;

    const duration = FLOAT_TIMES[index % FLOAT_TIMES.length];
    phase.set(
      withDelay(
        (index * duration) / 3,
        withRepeat(withTiming(1, { duration, easing: EASE }), -1, true),
      ),
    );

    return () => {
      cancelAnimation(phase);
      phase.set(0.5);
    };
  }, [index, phase, still]);

  const float = useDerivedValue<Transforms3d>(() => {
    const swing = phase.get() * 2 - 1;
    const tilt = swing * FLOAT_TILT * (index % 2 === 0 ? 1 : -1);

    return [{ translateY: swing * FLOAT_RANGE }, { rotate: tilt * DEGREE }];
  });

  return <Moved xml={layer.xml} origin={layer.center} transform={float} />;
}

export function Twinkle({
  layer,
  index,
  still,
}: Motion & { layer: FadingLayer; index: number }) {
  const glow = useSharedValue(1);

  useEffect(() => {
    if (still) return;

    const duration = TWINKLE_TIMES[index % TWINKLE_TIMES.length];
    glow.set(
      withDelay(
        index * 180,
        withRepeat(withTiming(0, { duration, easing: EASE }), -1, true),
      ),
    );

    return () => {
      cancelAnimation(glow);
      glow.set(1);
    };
  }, [glow, index, still]);

  const shine = useDerivedValue(
    () => TWINKLE_OPACITY + (1 - TWINKLE_OPACITY) * glow.get(),
  );
  const shrink = useDerivedValue<Transforms3d>(() => [
    { scale: TWINKLE_SCALE + (1 - TWINKLE_SCALE) * glow.get() },
  ]);

  return <Faded layer={layer} opacity={shine} transform={shrink} />;
}

export function Pulse({
  layer,
  delay,
  still,
}: Motion & { layer: FadingLayer; delay: number }) {
  const level = useSharedValue(1);

  useEffect(() => {
    if (still) return;

    level.set(
      withDelay(
        delay,
        withRepeat(
          withTiming(PULSE_OPACITY, { duration: PULSE_TIME, easing: EASE }),
          -1,
          true,
        ),
      ),
    );

    return () => {
      cancelAnimation(level);
      level.set(1);
    };
  }, [delay, level, still]);

  return <Faded layer={layer} opacity={level} />;
}

export function Grow({
  layer,
  index,
  still,
}: Motion & { layer: ArtLayer; index: number }) {
  const height = useSharedValue(1);

  useEffect(() => {
    if (still) return;

    height.set(
      withDelay(
        index * GROW_STAGGER,
        withRepeat(
          withTiming(GROW_LOW, { duration: GROW_TIME, easing: EASE }),
          -1,
          true,
        ),
      ),
    );

    return () => {
      cancelAnimation(height);
      height.set(1);
    };
  }, [height, index, still]);

  const grow = useDerivedValue<Transforms3d>(() => [{ scaleY: height.get() }]);

  return <Moved xml={layer.xml} origin={layer.center} transform={grow} />;
}
