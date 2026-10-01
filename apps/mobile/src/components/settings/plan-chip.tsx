import { Sparkles } from '@tamagui/lucide-icons-2/icons/Sparkles';
import { SizableText, XStack } from 'tamagui';

import { Chip } from '@/components/common/chip';
import { SPACING, TEXT } from '@/constants/layout';
import type { Tier } from '@/features/auth/types';
import { useTranslations } from '@/lib/i18n';

import { planLabelKey } from './account';

export function PlanChip({ tier }: { tier: Tier }) {
  const { t } = useTranslations();
  const key = planLabelKey(tier);
  const name =
    key === null ? tier.charAt(0).toUpperCase() + tier.slice(1) : t(key);
  const paid = tier !== 'free';

  return (
    <Chip
      label={name}
      Icon={paid ? Sparkles : undefined}
      highlighted={paid}
      accessibilityLabel={t('account.plan.label', { plan: name })}
    />
  );
}

export function PlanRow({ tier }: { tier: Tier }) {
  const { t } = useTranslations();

  return (
    <XStack
      items="center"
      gap={SPACING.items}
      px={SPACING.card}
      py={SPACING.items}
    >
      <SizableText flex={1} size={TEXT.body} color="$cardForeground">
        {t('account.plan.row')}
      </SizableText>
      <PlanChip tier={tier} />
    </XStack>
  );
}
