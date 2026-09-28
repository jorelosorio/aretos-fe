import { Skia, type SkPicture } from '@shopify/react-native-skia';

import { VIEWBOX } from './art-layer';

const pictures = new Map<string, SkPicture>();

/**
 * A layer's SVG as a Skia picture, parsed and recorded the first time it is
 * asked for and reused from then on.
 *
 * Parsing is the costly part of drawing a layer and its markup never changes,
 * so it happens once per app run: every frame of an animation, and every later
 * visit to the screen, replays the recorded picture instead. A picture holds
 * vector drawing commands rather than pixels, so it stays sharp at any size
 * and under any transform the animation applies.
 *
 * Recording is lazy rather than at import, so a drawing the user never sees
 * costs nothing at startup.
 */
export function artPicture(xml: string): SkPicture {
  const cached = pictures.get(xml);
  if (cached) return cached;

  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, VIEWBOX, VIEWBOX));
  const svg = Skia.SVG.MakeFromString(xml);
  if (svg) canvas.drawSvg(svg, VIEWBOX, VIEWBOX);
  const picture = recorder.finishRecordingAsPicture();

  pictures.set(xml, picture);
  return picture;
}
