import {
  ArtFrame,
  Float,
  Grow,
  Layer,
  Sweep,
  Twinkle,
  useArtMotion,
} from './art-motion';
import {
  ARM,
  BACKDROP,
  BADGE,
  BARS,
  BOARD,
  PERSON,
  PERSON_BACK,
  SHOULDER,
  SPARKLES,
} from './no-data-art-layers';

export function NoDataArt({ size }: { size: number }) {
  const motion = useArtMotion(size);

  return (
    <ArtFrame size={size}>
      <Layer xml={BACKDROP} />

      {SPARKLES.map((layer, index) => (
        <Twinkle key={index} layer={layer} index={index} {...motion} />
      ))}

      <Layer xml={BOARD} />

      {BARS.map((layer, index) => (
        <Grow key={index} layer={layer} index={index} {...motion} />
      ))}

      <Float layer={BADGE} index={1} {...motion} />

      <Layer xml={PERSON_BACK} />
      <Sweep xml={ARM} pivot={SHOULDER} {...motion} />
      <Layer xml={PERSON} />
    </ArtFrame>
  );
}
