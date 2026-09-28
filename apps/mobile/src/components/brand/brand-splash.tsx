import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SizableText, YStack } from 'tamagui';

import { BRAND_NAME } from '@/constants/brand';
import { SPACING, TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

import { Aurora } from './aurora';
import { BrandMark, MARK_SIZE } from './brand-mark';

const TRACK = 96;
const SWEEP = 36;
const SWEEP_TIME = 1100;

export function BrandSplash() {
  const { t } = useTranslations();
  const still = useReducedMotion();
  const offset = useSharedValue(0);

  useEffect(() => {
    if (still) return;
    offset.set(
      withRepeat(
        withTiming(1, {
          duration: SWEEP_TIME,
          easing: Easing.inOut(Easing.quad),
        }),
        -1,
        false,
      ),
    );
  }, [still, offset]);

  const sweep = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: still
          ? (TRACK - SWEEP) / 2
          : -SWEEP + offset.get() * (TRACK + SWEEP),
      },
    ],
  }));

  return (
    <YStack
      flex={1}
      bg="$background"
      items="center"
      justify="center"
      accessibilityRole="progressbar"
      accessibilityLabel={t('auth.loading')}
      accessibilityState={{ busy: true }}
    >
      <Aurora />
      <BrandMark size="lg" />
      <YStack
        position="absolute"
        t="50%"
        mt={MARK_SIZE.lg / 2 + SPACING.sectionPx}
        items="center"
        gap={SPACING.items}
      >
        <SizableText
          size={TEXT.subheading}
          fontFamily="$heading"
          color="$color"
        >
          {BRAND_NAME}
        </SizableText>
        <YStack
          width={TRACK}
          height={3}
          rounded={2}
          bg="$muted"
          overflow="hidden"
        >
          <Animated.View style={[{ width: SWEEP, height: 3 }, sweep]}>
            <YStack flex={1} bg="$primary" rounded={2} />
          </Animated.View>
        </YStack>
      </YStack>
    </YStack>
  );
}
