import { useEffect, type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';

import {
  BACKDROP,
  BADGES,
  DOTS,
  FOREARM,
  HAND,
  PENCIL,
  SCENE,
  SCENE_TOP,
  SPARKLES,
  VIEWBOX,
  WRIST,
  type ArtLayer,
} from './no-goals-art-layers';

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

const DOT_TIME = 650;
const DOT_STAGGER = 220;
const DOT_OPACITY = 0.3;

const EASE = Easing.inOut(Easing.sin);

function offset([x, y]: readonly [number, number], unit: number) {
  return { dx: (x - VIEWBOX / 2) * unit, dy: (y - VIEWBOX / 2) * unit };
}

function Layer({
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

function TappingHand({ unit, still }: { unit: number; still: boolean }) {
  const angle = useSharedValue(0);
  const { dx, dy } = offset(WRIST, unit);

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
      <Layer xml={PENCIL} style={turn} />
      <Layer xml={FOREARM} />
      <Layer xml={HAND} style={turn} />
    </>
  );
}

function FloatingBadge({
  layer,
  index,
  unit,
  still,
}: {
  layer: ArtLayer;
  index: number;
  unit: number;
  still: boolean;
}) {
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

function Twinkle({
  layer,
  index,
  unit,
  still,
}: {
  layer: ArtLayer;
  index: number;
  unit: number;
  still: boolean;
}) {
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

function ThoughtDot({
  layer,
  index,
  still,
}: {
  layer: ArtLayer;
  index: number;
  still: boolean;
}) {
  const level = useSharedValue(1);

  useEffect(() => {
    if (still) return;

    level.set(
      withDelay(
        (DOTS.length - 1 - index) * DOT_STAGGER,
        withRepeat(
          withTiming(DOT_OPACITY, { duration: DOT_TIME, easing: EASE }),
          -1,
          true,
        ),
      ),
    );

    return () => cancelAnimation(level);
  }, [index, level, still]);

  const pulse = useAnimatedStyle(() => ({ opacity: level.get() }));

  return <Layer xml={layer.xml} style={pulse} />;
}

export function NoGoalsArt({ size }: { size: number }) {
  const still = useReducedMotion();
  const unit = size / VIEWBOX;

  return (
    <View
      style={{ width: size, height: size }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Layer xml={BACKDROP} />

      {SPARKLES.map((layer, index) => (
        <Twinkle
          key={index}
          layer={layer}
          index={index}
          unit={unit}
          still={still}
        />
      ))}

      {DOTS.map((layer, index) => (
        <ThoughtDot key={index} layer={layer} index={index} still={still} />
      ))}

      {BADGES.map((layer, index) => (
        <FloatingBadge
          key={index}
          layer={layer}
          index={index}
          unit={unit}
          still={still}
        />
      ))}

      <Layer xml={SCENE} />
      <TappingHand unit={unit} still={still} />
      <Layer xml={SCENE_TOP} />
    </View>
  );
}
