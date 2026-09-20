import { Circle, G, Path, Svg } from 'react-native-svg';

import type { MoodScore } from '@/features/logs';

import {
  FACE_HEAD,
  FACE_STROKE_WIDTH,
  FACE_VIEW_BOX,
  MOOD_FACES,
} from './mood-faces';

const ASPECT = 76 / 108;

export function MoodFace({
  score,
  size,
  color,
}: {
  score: MoodScore;
  size: number;
  color: string;
}) {
  const face = MOOD_FACES[score];

  return (
    <Svg
      width={size * ASPECT}
      height={size}
      viewBox={FACE_VIEW_BOX}
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
        <Path d={face.jaw} />
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
