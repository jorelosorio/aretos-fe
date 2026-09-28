import {
  ArtFrame,
  Float,
  Layer,
  Pulse,
  TappingHand,
  Twinkle,
  useArtMotion,
} from './art-motion';
import {
  BACKDROP,
  BOUNDS,
  BADGES,
  DOTS,
  FOREARM,
  HAND,
  PENCIL,
  SCENE,
  SCENE_TOP,
  SPARKLES,
  WRIST,
} from './no-goals-art-layers';

const DOT_STAGGER = 220;

export function NoGoalsArt({ size }: { size: number }) {
  const motion = useArtMotion();

  return (
    <ArtFrame size={size} bounds={BOUNDS}>
      <Layer xml={BACKDROP} />

      {SPARKLES.map((layer, index) => (
        <Twinkle key={index} layer={layer} index={index} {...motion} />
      ))}

      {DOTS.map((layer, index) => (
        <Pulse
          key={index}
          layer={layer}
          delay={(DOTS.length - 1 - index) * DOT_STAGGER}
          still={motion.still}
        />
      ))}

      {BADGES.map((layer, index) => (
        <Float key={index} layer={layer} index={index} {...motion} />
      ))}

      <Layer xml={SCENE} />
      <TappingHand
        pencil={PENCIL}
        forearm={FOREARM}
        hand={HAND}
        wrist={WRIST}
        {...motion}
      />
      <Layer xml={SCENE_TOP} />
    </ArtFrame>
  );
}
