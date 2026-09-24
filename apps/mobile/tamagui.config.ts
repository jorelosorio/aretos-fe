import { fonts } from './fonts';
import { themes } from './themes';
import { defaultConfig } from '@tamagui/config/v5';
import { createTamagui } from 'tamagui';

export const config = createTamagui({
  ...defaultConfig,
  fonts,
  themes,
  defaultProps: {
    // The rounding matches the web app's `rounded-4xl`; the face does not.
    // The web sets its buttons in the display face, but here that face is
    // reserved for naming a subject (see `fonts.ts`), and a label is an
    // action, not a subject — native buttons on both platforms are set in the
    // text face, weighted up.
    Button: { fontFamily: '$body', fontWeight: '700', rounded: '$xl4' },
  },
  tokens: {
    ...defaultConfig.tokens,
    radius: {
      ...defaultConfig.tokens.radius,
      sm: 5,
      md: 7.5,
      lg: 10,
      xl: 13.5,
      xl2: 17,
      xl3: 21,
      xl4: 25,
    },
  },
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
