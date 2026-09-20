import { Circle, G, Path, Svg } from 'react-native-svg';

import type { MoodScore } from '@/features/logs';

import {
  FACE_BOX,
  FACE_HEAD,
  FACE_HEAD_BOX,
  FACE_STROKE_WIDTH,
  MOOD_FACES,
} from './mood-faces';

export function MoodFace({
  score,
  size,
  color,
  headOnly = false,
}: {
  score: MoodScore;
  size: number;
  color: string;
  headOnly?: boolean;
}) {
  const face = MOOD_FACES[score];
  const box = headOnly ? FACE_HEAD_BOX : FACE_BOX;

  return (
    <Svg
      width={size * box.aspect}
      height={size}
      viewBox={box.viewBox}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <G
        fill="none"
        stroke={color}
        strokeWidth={FACE_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {!headOnly && <Path d={face.jaw} />}
        <Circle cx={FACE_HEAD.cx} cy={FACE_HEAD.cy} r={FACE_HEAD.r} />
        {face.brows.map((d) => (
          <Path key={d} d={d} />
        ))}
        {face.pupils.map((pupil) => (
          <Circle
            key={pupil.cx}
            cx={pupil.cx}
            cy={pupil.cy}
            r={pupil.r}
            fill={color}
            stroke="none"
          />
        ))}
        <Path d={face.mouth} />
      </G>
    </Svg>
  );
}
