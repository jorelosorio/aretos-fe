import {
  ArtFrame,
  Float,
  Layer,
  Twinkle,
  useArtMotion,
  Writing,
} from './art-motion';
import {
  ARM,
  ARM_ANCHOR,
  BACKDROP,
  BOUNDS,
  BADGE,
  HAND,
  INK,
  INK_START,
  REACH,
  SCENE,
  SCENE_TOP,
  SPARKLES,
  STROKE,
} from './empty-diary-art-layers';

export function EmptyDiaryArt({ size }: { size: number }) {
  const motion = useArtMotion(size);

  return (
    <ArtFrame size={size} bounds={BOUNDS}>
      <Layer xml={BACKDROP} />

      {SPARKLES.map((layer, index) => (
        <Twinkle key={index} layer={layer} index={index} {...motion} />
      ))}

      <Float layer={BADGE} index={1} {...motion} />

      <Layer xml={SCENE} />
      <Writing
        arm={ARM}
        hand={HAND}
        anchor={ARM_ANCHOR}
        reach={REACH}
        ink={INK}
        inkStart={INK_START}
        stroke={STROKE}
        {...motion}
      />
      <Layer xml={SCENE_TOP} />
    </ArtFrame>
  );
}
