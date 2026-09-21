/**
 * SVG files imported as bundled assets.
 *
 * Metro already lists `svg` among its asset extensions, so an import returns
 * the same asset reference a PNG would and `expo-image`, which renders SVG on
 * all three platforms, draws it. No transformer, and nothing turns the file
 * into a component — these are pictures, not icons to be recoloured.
 */
declare module '*.svg' {
  import type { ImageSourcePropType } from 'react-native';

  const source: ImageSourcePropType;
  export default source;
}
