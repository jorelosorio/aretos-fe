import type { ReactNode } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from '@tamagui/lucide-icons-2/icons/X';
import { SizableText, XStack, YStack } from 'tamagui';

import { FormScrollView } from '@/components/common/form-scroll-view';
import { HeaderIconButton } from '@/components/common/header-actions';
import { SheetHandle } from '@/components/common/sheet-handle';
import { SHEET, SPACING, TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

const DRAWS_HANDLE = Platform.OS === 'android';

export function AuthSheet({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { t } = useTranslations();
  const router = useRouter();

  return (
    <YStack flex={1} bg="$background">
      {DRAWS_HANDLE && <SheetHandle />}
      <FormScrollView>
        <YStack
          px={SHEET.padding}
          pt={DRAWS_HANDLE ? SPACING.text : SPACING.section}
          pb={SPACING.section}
          gap={SPACING.section}
        >
          <XStack items="center" gap={SPACING.items}>
            <SizableText
              flex={1}
              size={TEXT.title}
              fontFamily="$heading"
              fontWeight="700"
              color="$color"
              accessibilityRole="header"
            >
              {title}
            </SizableText>
            <HeaderIconButton
              Icon={X}
              label={t('sheet.close')}
              onPress={() => router.back()}
            />
          </XStack>
          {children}
        </YStack>
      </FormScrollView>
    </YStack>
  );
}
