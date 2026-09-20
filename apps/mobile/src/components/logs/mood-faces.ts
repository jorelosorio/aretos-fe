/**
 * One line-art face per point on the log's 1-5 mood scale.
 *
 * The scale itself belongs to the logs feature, which is where the server's
 * `min=1,max=5` is written down; this file only draws it.
 *
 * Shapes are traced from the web app's `mood-face.tsx` (Claude Design, Organic
 * system) so both clients draw the same five expressions. Kept as five
 * hand-tuned shapes rather than one formula interpolating "sad" to "happy":
 * the detail that sells each face — closed, brow-raised eyes and no pupils at
 * 5, a flat brow-less mouth at 3 — does not reduce to a parametric curve. Only
 * the head, a plain circle, is shared.
 */

import type { MoodScore } from '@/features/logs';

type Pupil = { cx: number; cy: number; r: number };

export type FaceShape = {
  jaw: string;
  brows: readonly string[];
  mouth: string;
  pupils: readonly Pupil[];
};

/** The head every face shares, in the same units the paths were traced in. */
export const FACE_HEAD = { cx: 80, cy: 72, r: 36 } as const;

/**
 * Cropped to the drawing rather than to the 160-unit grid it was traced on:
 * the shapes only ever occupy x 44-116 and y 36-137, so a square box around
 * them would render the head at 45% of the footprint the caller paid for. The
 * box is the artwork's bounds plus room for the stroke, which is why it is
 * portrait — the chin arc sits well below the head.
 */
export const FACE_VIEW_BOX = '42 33 76 108';

/**
 * Scales with the art, so the weight reads the same at every size. 1.6 was
 * traced at 160 units and resolved to a hairline that antialiased away to
 * grey — the faces looked faint rather than fine.
 */
export const FACE_STROKE_WIDTH = 3;

export const MOOD_FACES: Record<MoodScore, FaceShape> = {
  1: {
    jaw: 'M56 132 Q80 140 104 132',
    brows: ['M66 64 Q70 60 75 63', 'M94 64 Q90 60 85 63'],
    mouth: 'M64 90 Q80 82 96 90',
    pupils: [
      { cx: 70, cy: 70, r: 2.4 },
      { cx: 90, cy: 70, r: 2.4 },
    ],
  },
  2: {
    jaw: 'M56 132 Q80 140 104 132',
    brows: ['M67 65 Q71 62 76 64', 'M93 65 Q89 62 84 64'],
    mouth: 'M68 89 Q80 85 92 89',
    pupils: [
      { cx: 70, cy: 70, r: 2.4 },
      { cx: 90, cy: 70, r: 2.4 },
    ],
  },
  3: {
    jaw: 'M56 132 Q80 140 104 132',
    brows: [],
    mouth: 'M70 88 Q80 91 90 88',
    pupils: [
      { cx: 70, cy: 68, r: 2.6 },
      { cx: 90, cy: 68, r: 2.6 },
    ],
  },
  4: {
    jaw: 'M56 132 Q80 140 104 132',
    brows: ['M68 66 Q72 62 77 65', 'M92 66 Q88 62 83 65'],
    mouth: 'M67 86 Q80 96 93 86',
    pupils: [
      { cx: 70, cy: 70, r: 2.6 },
      { cx: 90, cy: 70, r: 2.6 },
    ],
  },
  5: {
    jaw: 'M56 132 Q80 142 104 132',
    brows: ['M65 68 Q71 61 78 67', 'M95 68 Q89 61 82 67'],
    mouth: 'M64 84 Q80 100 96 84',
    pupils: [],
  },
};
