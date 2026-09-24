/**
 * One line-art face per point on the log's 1-5 mood scale.
 *
 * The scale itself belongs to the logs feature, which is where the server's
 * `min=1,max=5` is written down; this file only draws it.
 *
 * Kept as five hand-tuned shapes rather than one formula interpolating "sad"
 * to "happy": what sells each face — closed, arched eyes and no pupils at 5, a
 * dead-flat mouth and no brows at 3 — does not reduce to a parametric curve.
 * Only the head, a plain circle, is shared.
 *
 * Every shape is mirrored about x 80, the head's centre. A face whose halves
 * disagree by a unit reads as a squint rather than as an expression, so the
 * right-hand path of a pair is always the left one reflected.
 */

import type { MoodScore } from '@/features/logs';

type Pupil = { cx: number; cy: number; r: number };

export type FaceShape = {
  /**
   * The marks above the eyes — except at 5, where they *are* the eyes.
   *
   * A face that is happy enough closes them, and a closed eye is an arch in
   * the same weight a brow is drawn in. Giving 5 both would put four strokes
   * where the other faces have two.
   */
  brows: readonly string[];
  mouth: string;
  pupils: readonly Pupil[];
};

/** The head every face shares, in the same units the paths were traced in. */
export const FACE_HEAD = { cx: 80, cy: 72, r: 36 } as const;

export type FaceBox = { viewBox: string; aspect: number };

/**
 * The head and everything inside it, and nothing below.
 *
 * The faces used to carry a chin arc under the head, which made the drawing
 * portrait and the box a tall sliver: the head then rendered at well under
 * half the footprint the caller paid for. Cropping to the head alone makes
 * the box square, so a face takes the width it looks like it takes and the
 * head fills the size it was given.
 *
 * Bounds are the head circle (cx 80, cy 72, r 36) plus half the stroke.
 */
export const FACE_BOX: FaceBox = { viewBox: '42 34 76 76', aspect: 1 };

/**
 * Scales with the art, so the weight reads the same at every size. 1.6 was
 * traced at 160 units and resolved to a hairline that antialiased away to
 * grey — the faces looked faint rather than fine.
 */
export const FACE_STROKE_WIDTH = 3;

/**
 * The dashes of the empty head drawn where a period has no mood.
 *
 * It is the face's own head, dashed, so a day with no answer holds the exact
 * footprint a face would and the row does not shift as moods are filled in.
 * In head units, not points: about a dozen dashes round a 36-unit head, which
 * still reads as "dashed" rather than "dotted" once scaled down to a 16-18pt
 * glyph. Solid would read as a face with its features missing.
 */
export const FACE_BLANK_DASH = '10 9';

/**
 * The five, read left to right as the picker lays them out.
 *
 * Two things carry the scale, and they move together so neighbouring faces
 * never differ by one detail alone: the mouth swings from a deep frown
 * through flat to a wide smile, and the brows go from raised-at-the-inside
 * (worry) through absent (nothing to say) to arched (delight).
 */
export const MOOD_FACES: Record<MoodScore, FaceShape> = {
  1: {
    brows: ['M66 66 Q71 62 77 60', 'M94 66 Q89 62 83 60'],
    mouth: 'M66 93 Q80 79 94 93',
    pupils: [
      { cx: 70, cy: 71, r: 2.4 },
      { cx: 90, cy: 71, r: 2.4 },
    ],
  },
  2: {
    brows: ['M67 64 Q72 62 77 63', 'M93 64 Q88 62 83 63'],
    mouth: 'M68 90 Q80 84 92 90',
    pupils: [
      { cx: 70, cy: 70, r: 2.5 },
      { cx: 90, cy: 70, r: 2.5 },
    ],
  },
  3: {
    brows: [],
    mouth: 'M69 89 L91 89',
    pupils: [
      { cx: 70, cy: 69, r: 2.6 },
      { cx: 90, cy: 69, r: 2.6 },
    ],
  },
  4: {
    brows: ['M67 62 Q72 58 77 61', 'M93 62 Q88 58 83 61'],
    mouth: 'M66 85 Q80 97 94 85',
    pupils: [
      { cx: 70, cy: 70, r: 2.6 },
      { cx: 90, cy: 70, r: 2.6 },
    ],
  },
  5: {
    brows: ['M64 72 Q70 63 76 72', 'M96 72 Q90 63 84 72'],
    mouth: 'M62 82 Q80 101 98 82',
    pupils: [],
  },
};
