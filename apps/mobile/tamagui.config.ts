import { fonts } from './fonts';
import { themes } from './themes';
import { defaultConfig } from '@tamagui/config/v5';
import { createTamagui } from 'tamagui';

export const config = createTamagui({
  ...defaultConfig,
  fonts,
  themes,
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
