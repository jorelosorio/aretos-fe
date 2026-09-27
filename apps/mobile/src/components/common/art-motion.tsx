import { useEffect, type ComponentProps, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useIsFocused } from 'expo-router';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';

import {
  ART_EXTENT,
  VIEWBOX,
  type ArtBounds,
  type ArtLayer,
} from './art-layer';

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

type Motion = { unit: number; still: boolean };

function offset([x, y]: readonly [number, number], unit: number) {
  return { dx: (x - VIEWBOX / 2) * unit, dy: (y - VIEWBOX / 2) * unit };
}

export function useArtMotion(size: number): Motion {
  const reduced = useReducedMotion();
  const focused = useIsFocused();

  return { unit: size / VIEWBOX, still: reduced || !focused };
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
  const unit = size / VIEWBOX;
  const scale = ART_EXTENT / Math.max(right - left, bottom - top);
  const shiftX = (VIEWBOX / 2 - (left + right) / 2) * scale * unit;
  const shiftY = (VIEWBOX / 2 - (top + bottom) / 2) * scale * unit;

  return (
    <View
      style={{ width: size, height: size }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [
              { translateX: shiftX },
              { translateY: shiftY },
              { scale },
            ],
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export function Layer({
  xml,
  style,
}: {
  xml: string;
  style?: ComponentProps<typeof Animated.View>['style'];
}) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, style]}
    >
      <SvgXml xml={xml} width="100%" height="100%" />
    </Animated.View>
  );
}

export function TappingHand({
  pencil,
  forearm,
  hand,
  wrist,
  unit,
  still,
}: Motion & {
  pencil: string;
  forearm: string;
  hand: string;
  wrist: readonly [number, number];
}) {
  const angle = useSharedValue(0);
  const { dx, dy } = offset(wrist, unit);

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

    return () => cancelAnimation(angle);
  }, [angle, still]);

  const turn = useAnimatedStyle(() => ({
    transform: [
      { translateX: dx },
      { translateY: dy },
      { rotate: `${angle.get()}deg` },
      { translateX: -dx },
      { translateY: -dy },
    ],
  }));

  return (
    <>
      <Layer xml={pencil} style={turn} />
      <Layer xml={forearm} />
      <Layer xml={hand} style={turn} />
    </>
  );
}

export function Sweep({
  xml,
  pivot,
  unit,
  still,
}: Motion & { xml: string; pivot: readonly [number, number] }) {
  const angle = useSharedValue(0);
  const { dx, dy } = offset(pivot, unit);

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

    return () => cancelAnimation(angle);
  }, [angle, still]);

  const turn = useAnimatedStyle(() => ({
    transform: [
      { translateX: dx },
      { translateY: dy },
      { rotate: `${angle.get()}deg` },
      { translateX: -dx },
      { translateY: -dy },
    ],
  }));

  return <Layer xml={xml} style={turn} />;
}

export function Writing({
  arm,
  hand,
  ink,
  anchor,
  reach,
  inkStart,
  stroke,
  unit,
  still,
}: Motion & {
  arm: string;
  hand: string;
  ink: string;
  anchor: readonly [number, number];
  reach: number;
  inkStart: readonly [number, number];
  stroke: readonly [number, number];
}) {
  const progress = useSharedValue(1);
  const { dx, dy } = offset(inkStart, unit);
  const shoulder = offset(anchor, unit);
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

    return () => cancelAnimation(progress);
  }, [progress, still]);

  const pen = useDerivedValue(() => {
    const p = progress.get();
    const along = p <= 1 ? p : 2 - p;
    const wiggle =
      p < 1 ? Math.sin(p * Math.PI * 2 * WRITE_WAVES) * WRITE_WIGGLE : 0;
    const lift = p > 1 ? Math.sin((p - 1) * Math.PI) * WRITE_LIFT : 0;

    return { x: along * runX, y: along * runY + wiggle - lift };
  });

  const write = useAnimatedStyle(() => ({
    transform: [
      { translateX: pen.get().x * unit },
      { translateY: pen.get().y * unit },
    ],
  }));

  const stretch = useAnimatedStyle(() => ({
    transform: [
      { translateX: shoulder.dx },
      { translateY: shoulder.dy },
      { scaleX: 1 + pen.get().x / reach },
      { skewY: `${(Math.atan(pen.get().y / reach) * 180) / Math.PI}deg` },
      { translateX: -shoulder.dx },
      { translateY: -shoulder.dy },
    ],
  }));

  const fill = useAnimatedStyle(() => {
    const p = progress.get();

    return {
      opacity: p <= 1 ? 1 : Math.max(0, 1 - (p - 1) * 1.6),
      transform: [
        { translateX: dx },
        { translateY: dy },
        { scaleX: p <= 1 ? Math.max(p, 0.001) : 1 },
        { translateX: -dx },
        { translateY: -dy },
      ],
    };
  });

  return (
    <>
      <Layer xml={ink} style={fill} />
      <Layer xml={arm} style={stretch} />
      <Layer xml={hand} style={write} />
    </>
  );
}

export function Float({
  layer,
  index,
  unit,
  still,
}: Motion & { layer: ArtLayer; index: number }) {
  const phase = useSharedValue(0.5);
  const { dx, dy } = offset(layer.center, unit);

  useEffect(() => {
    if (still) return;

    const duration = FLOAT_TIMES[index % FLOAT_TIMES.length];
    phase.set(
      withDelay(
        (index * duration) / 3,
        withRepeat(withTiming(1, { duration, easing: EASE }), -1, true),
      ),
    );

    return () => cancelAnimation(phase);
  }, [index, phase, still]);

  const float = useAnimatedStyle(() => {
    const swing = phase.get() * 2 - 1;

    return {
      transform: [
        { translateY: swing * FLOAT_RANGE * unit },
        { translateX: dx },
        { translateY: dy },
        { rotate: `${swing * FLOAT_TILT * (index % 2 === 0 ? 1 : -1)}deg` },
        { translateX: -dx },
        { translateY: -dy },
      ],
    };
  });

  return <Layer xml={layer.xml} style={float} />;
}

export function Twinkle({
  layer,
  index,
  unit,
  still,
}: Motion & { layer: ArtLayer; index: number }) {
  const glow = useSharedValue(1);
  const { dx, dy } = offset(layer.center, unit);

  useEffect(() => {
    if (still) return;

    const duration = TWINKLE_TIMES[index % TWINKLE_TIMES.length];
    glow.set(
      withDelay(
        index * 180,
        withRepeat(withTiming(0, { duration, easing: EASE }), -1, true),
      ),
    );

    return () => cancelAnimation(glow);
  }, [glow, index, still]);

  const shine = useAnimatedStyle(() => {
    const level = glow.get();

    return {
      opacity: TWINKLE_OPACITY + (1 - TWINKLE_OPACITY) * level,
      transform: [
        { translateX: dx },
        { translateY: dy },
        { scale: TWINKLE_SCALE + (1 - TWINKLE_SCALE) * level },
        { translateX: -dx },
        { translateY: -dy },
      ],
    };
  });

  return <Layer xml={layer.xml} style={shine} />;
}

export function Pulse({
  layer,
  delay,
  still,
}: {
  layer: ArtLayer;
  delay: number;
  still: boolean;
}) {
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

    return () => cancelAnimation(level);
  }, [delay, level, still]);

  const pulse = useAnimatedStyle(() => ({ opacity: level.get() }));

  return <Layer xml={layer.xml} style={pulse} />;
}

export function Grow({
  layer,
  index,
  unit,
  still,
}: Motion & { layer: ArtLayer; index: number }) {
  const height = useSharedValue(1);
  const { dx, dy } = offset(layer.center, unit);

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

    return () => cancelAnimation(height);
  }, [height, index, still]);

  const grow = useAnimatedStyle(() => ({
    transform: [
      { translateX: dx },
      { translateY: dy },
      { scaleY: height.get() },
      { translateX: -dx },
      { translateY: -dy },
    ],
  }));

  return <Layer xml={layer.xml} style={grow} />;
}
