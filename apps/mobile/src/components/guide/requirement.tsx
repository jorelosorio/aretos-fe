import { Circle } from '@tamagui/lucide-icons-2/icons/Circle';
import { CircleCheck } from '@tamagui/lucide-icons-2/icons/CircleCheck';
import type { ReactNode } from 'react';
import { SizableText, XStack, YStack } from 'tamagui';

import { FormSection } from '@/components/common/form-section';

import { ICON, SPACING, TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

export function Requirement({ label, met }: { label: string; met: boolean }) {
  const { t } = useTranslations();
  const Icon = met ? CircleCheck : Circle;
  const state = t(met ? 'guide.requirement.met' : 'guide.requirement.missing');

  return (
    <XStack items="center" gap="$2" accessibilityLabel={`${label}. ${state}`}>
      <Icon size={ICON.row} color={met ? '$outcomeDone' : '$mutedForeground'} />
      <SizableText
        size={TEXT.caption}
        color={met ? '$color' : '$mutedForeground'}
      >
        {label}
      </SizableText>
    </XStack>
  );
}

export function Requirements({ children }: { children: ReactNode }) {
  const { t } = useTranslations();

  return (
    <FormSection title={t('guide.requirement.title')}>
      <YStack gap={SPACING.group} accessibilityLiveRegion="polite">
        {children}
      </YStack>
    </FormSection>
  );
}
