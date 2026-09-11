import { createSystemFont, fonts as baseFonts } from '@tamagui/config/v5';

const body = createSystemFont({
  font: {
    family: 'Nunito-Regular',
    face: {
      400: { normal: 'Nunito-Regular' },
      500: { normal: 'Nunito-Medium' },
      600: { normal: 'Nunito-SemiBold' },
      700: { normal: 'Nunito-Bold' },
    },
  },
});

const heading = createSystemFont({
  font: { family: 'Caprasimo-Regular' },
});

export const fonts = { ...baseFonts, body, heading };
