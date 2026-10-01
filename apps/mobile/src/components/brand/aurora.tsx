import { useEffect, useMemo, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { Canvas, Fill, Shader, Skia } from '@shopify/react-native-skia';
import {
  Easing,
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme, useThemeName } from '@tamagui/core';

import { resolveColor } from '@/components/common/theme-color';

import {
  AURORA_SKSL,
  STILL_TIME,
  auroraPalette,
  stepClock,
} from './aurora-shader';

const EFFECT = Skia.RuntimeEffect.Make(AURORA_SKSL);
const SCALE = 1 / 3;
const FPS = 30;
const IDLE_FPS = 15;
const EASE = 0.04;
const FORM_MS = 1800;

export function Aurora({ idle = false }: { idle?: boolean }) {
  const theme = useTheme();
  const still = useReducedMotion();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const form = useSharedValue(still ? 1 : 0);

  useEffect(() => {
    if (still) {
      form.set(1);
      return;
    }
    form.set(
      withTiming(1, { duration: FORM_MS, easing: Easing.out(Easing.quad) }),
    );
  }, [still, form]);

  const ground = resolveColor(theme, '$background');
  const dark = useThemeName().startsWith('dark');
  const ember = resolveColor(theme, dark ? '$deco1' : '$deco1Vivid');
  const moss = resolveColor(theme, dark ? '$deco2' : '$deco2Vivid');
  const honey = resolveColor(theme, dark ? '$deco3' : '$deco3Vivid');
  const target = useMemo(
    () => auroraPalette({ ground, ember, moss, honey }),
    [ground, ember, moss, honey],
  );

  const palette = useSharedValue<number[]>(target ?? []);
  const goal = useSharedValue<number[]>(target ?? []);
  const time = useSharedValue(STILL_TIME);
  const fps = useSharedValue(idle ? IDLE_FPS : FPS);
  const pending = useSharedValue(0);

  useEffect(() => {
    if (target === null) return;
    goal.set(target);
    if (still) palette.set(target);
  }, [target, still, goal, palette]);

  useEffect(() => {
    fps.set(idle ? IDLE_FPS : FPS);
  }, [idle, fps]);

  const frame = useFrameCallback((info) => {
    const rate = fps.get();
    const step = stepClock(
      pending.get(),
      info.timeSincePreviousFrame ?? 0,
      1000 / rate,
    );
    pending.set(step.pending);
    if (!step.tick) return;
    time.set(time.get() + 1 / rate);

    const current = palette.get();
    const wanted = goal.get();
    palette.set(
      current.map((channel, i) => channel + (wanted[i] - channel) * EASE),
    );
  }, false);

  useEffect(() => {
    if (still) {
      frame.setActive(false);
      return;
    }
    frame.setActive(AppState.currentState === 'active');
    const subscription = AppState.addEventListener('change', (status) =>
      frame.setActive(status === 'active'),
    );
    return () => {
      subscription.remove();
      frame.setActive(false);
    };
  }, [still, frame]);

  const width = size.width * SCALE;
  const height = size.height * SCALE;

  const uniforms = useDerivedValue(() => {
    const p = palette.get();
    return {
      u_res: [width, height],
      u_time: still ? STILL_TIME : time.get(),
      u_bg: [p[0], p[1], p[2]],
      u_ember: [p[3], p[4], p[5]],
      u_moss: [p[6], p[7], p[8]],
      u_honey: [p[9], p[10], p[11]],
      u_form: form.get(),
    };
  });

  if (EFFECT === null || target === null) return null;

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={(event) => {
        const next = event.nativeEvent.layout;
        setSize((current) =>
          current.width === next.width && current.height === next.height
            ? current
            : { width: next.width, height: next.height },
        );
      }}
    >
      {width > 0 && height > 0 && (
        <Canvas
          style={{
            width,
            height,
            transform: [{ scale: 1 / SCALE }],
            transformOrigin: 'top left',
          }}
        >
          <Fill>
            <Shader source={EFFECT} uniforms={uniforms} />
          </Fill>
        </Canvas>
      )}
    </View>
  );
}
