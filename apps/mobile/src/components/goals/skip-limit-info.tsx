import { CirclePause } from '@tamagui/lucide-icons-2/icons/CirclePause';
import { Flame } from '@tamagui/lucide-icons-2/icons/Flame';
import { Hash } from '@tamagui/lucide-icons-2/icons/Hash';
import { Circle, SizableText, XStack, YStack } from 'tamagui';

import { BottomSheet } from '@/components/common/bottom-sheet';
import type { IconComponent } from '@/components/common/icon-component';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { TrackingFrequency } from '@/features/goals/types';
import { useTranslations } from '@/lib/i18n';

import { SKIP_LIMIT_COPY, skipAmount } from './skip-limit-copy';
import { SkipLimitExample } from './skip-limit-example';

const BADGE = 32;

function Fact({
  Icon,
  title,
  body,
}: {
  Icon: IconComponent;
  title: string;
  body: string;
}) {
  return (
    <XStack gap={SPACING.items} items="flex-start">
      <Circle size={BADGE} bg="$accentSurface">
        <Icon size={ICON.row} color="$accentSurfaceForeground" />
      </Circle>

      <YStack flex={1} gap={SPACING.text}>
        <SizableText size={TEXT.body} fontWeight="700" color="$color">
          {title}
        </SizableText>
        <SizableText size={TEXT.caption} color="$mutedForeground">
          {body}
        </SizableText>
      </YStack>
    </XStack>
  );
}

export function SkipLimitInfo({
  open,
  limit,
  frequency,
  onDismiss,
}: {
  open: boolean;
  limit: number;
  frequency: TrackingFrequency;
  onDismiss: () => void;
}) {
  const { t } = useTranslations();

  return (
    <BottomSheet
      open={open}
      title={t('goals.skipLimit.infoTitle')}
      detent="tall"
      onDismiss={onDismiss}
    >
      <YStack gap={SPACING.section} pb={SPACING.screen}>
        <YStack gap={SPACING.section}>
          <Fact
            Icon={CirclePause}
            title={t('goals.skipLimit.whatTitle')}
            body={t(SKIP_LIMIT_COPY[frequency].pause)}
          />
          <Fact
            Icon={Flame}
            title={t('goals.skipLimit.effectTitle')}
            body={t('goals.skipLimit.effectBody')}
          />
          <Fact
            Icon={Hash}
            title={t('goals.skipLimit.limitTitle')}
            body={
              limit === 0
                ? t('goals.skipLimit.limitNone')
                : t('goals.skipLimit.limitBody', {
                    amount: skipAmount(t, frequency, limit),
                  })
            }
          />
        </YStack>

        <SkipLimitExample limit={limit} frequency={frequency} />
      </YStack>
    </BottomSheet>
  );
}
