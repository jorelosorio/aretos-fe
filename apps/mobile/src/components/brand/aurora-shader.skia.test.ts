/**
 * @jest-environment @shopify/react-native-skia/jestEnv.js
 */
import type { CanvasKit } from 'canvaskit-wasm';

import { AURORA_SKSL } from './aurora-shader';

const canvasKit = (globalThis as unknown as { CanvasKit: CanvasKit }).CanvasKit;

describe('AURORA_SKSL', () => {
  it('compiles in Skia and exposes exactly the uniforms the aurora sets', () => {
    const effect = canvasKit.RuntimeEffect.Make(AURORA_SKSL);
    expect(effect).not.toBeNull();

    const names = Array.from({ length: effect!.getUniformCount() }, (_, i) =>
      effect!.getUniformName(i),
    );
    expect(names).toEqual([
      'u_res',
      'u_time',
      'u_bg',
      'u_ember',
      'u_moss',
      'u_honey',
      'u_form',
    ]);
  });
});
