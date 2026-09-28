import { useIsFocused, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, SizableText, XStack, YStack } from 'tamagui';

import { Aurora } from '@/components/brand/aurora';
import { BrandMark } from '@/components/brand/brand-mark';
import { Chip } from '@/components/common/chip';
import { slotColor } from '@/components/goals/slot-color';
import { BRAND_NAME } from '@/constants/brand';
import { BUTTON, SPACING, TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

import { LegalLinks } from './legal-links';

const BUTTON_TEXT_SCALE = 1.4;

export function WelcomeScreen() {
  const { t } = useTranslations();
  const router = useRouter();
  const focused = useIsFocused();
  const insets = useSafeAreaInsets();

  return (
    <YStack flex={1} bg="$background">
      <Aurora idle={!focused} />

      <YStack
        flex={1}
        justify="flex-end"
        gap={SPACING.section}
        px={SPACING.screen}
        pb={insets.bottom + SPACING.sectionPx}
      >
        <XStack items="center" gap="$2">
          <BrandMark size="md" />
          <SizableText size={TEXT.brand} fontFamily="$heading" color="$color">
            {BRAND_NAME}
          </SizableText>
        </XStack>

        <YStack gap={SPACING.items}>
          <SizableText
            size={TEXT.hero}
            fontFamily="$heading"
            fontWeight="700"
            color="$color"
            accessibilityRole="header"
          >
            {t('auth.welcome.headline')}
          </SizableText>
          <YStack gap={SPACING.text}>
            <XStack items="center" gap={SPACING.group} flexWrap="wrap">
              <Chip
                label={t('auth.welcome.example')}
                size="regular"
                dot={slotColor(0)}
              />
              <SizableText size={TEXT.lede} color="$mutedForeground">
                {t('auth.welcome.exampleNote')}
              </SizableText>
            </XStack>
            <SizableText size={TEXT.lede} color="$mutedForeground">
              {t('auth.welcome.description')}
            </SizableText>
          </YStack>
        </YStack>

        <XStack gap={SPACING.items} flexWrap="wrap">
          <Button
            grow={1}
            size={BUTTON.primary}
            theme="accent"
            maxFontSizeMultiplier={BUTTON_TEXT_SCALE}
            onPress={() => router.push('/signup')}
          >
            {t('auth.welcome.createAccount')}
          </Button>
          <Button
            grow={1}
            size={BUTTON.primary}
            bg="$card"
            color="$cardForeground"
            maxFontSizeMultiplier={BUTTON_TEXT_SCALE}
            onPress={() => router.push('/login')}
          >
            {t('auth.welcome.logIn')}
          </Button>
        </XStack>

        <LegalLinks />
      </YStack>
    </YStack>
  );
}
