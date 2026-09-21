import { Circle, G, Path, Svg } from 'react-native-svg';

import type { MoodScore } from '@/features/logs';

import {
  FACE_BOX,
  FACE_HEAD,
  FACE_STROKE_WIDTH,
  MOOD_FACES,
} from './mood-faces';

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
      width={size * FACE_BOX.aspect}
      height={size}
      viewBox={FACE_BOX.viewBox}
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
