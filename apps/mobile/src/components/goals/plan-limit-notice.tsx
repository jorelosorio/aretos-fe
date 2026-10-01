import { Info } from '@tamagui/lucide-icons-2/icons/Info';
import { Layers } from '@tamagui/lucide-icons-2/icons/Layers';
import { Paragraph, XStack } from 'tamagui';

import { Notice } from '@/components/common/notice';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { Allowance } from '@/features/limits/types';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

const COPY = {
  goal: {
    usage: 'goals.limit.usage',
    title: 'goals.limit.title',
    reached: 'goals.limit.reached',
    blockedTitle: 'goals.limit.blockedTitle',
    blocked: 'goals.limit.blocked',
  },
  template: {
    usage: 'templates.limit.usage',
    title: 'templates.limit.title',
    reached: 'templates.limit.reached',
    blockedTitle: 'templates.limit.blockedTitle',
    blocked: 'templates.limit.blocked',
  },
} as const satisfies Record<string, Record<string, TranslationKey>>;

export function PlanLimitNotice({
  allowance,
  resource = 'goal',
}: {
  allowance: Allowance;
  resource?: keyof typeof COPY;
}) {
  const { t } = useTranslations();
  const { known, canCreate, used, limit } = allowance;
  const copy = COPY[resource];

  if (!known) return null;
  if (limit === null && canCreate) return null;

  if (canCreate) {
    return (
      <XStack items="center" gap={SPACING.group} px="$2">
        <Info size={ICON.inline} color="$mutedForeground" />
        <Paragraph flex={1} size={TEXT.caption} color="$mutedForeground">
          {t(copy.usage, { used, limit })}
        </Paragraph>
      </XStack>
    );
  }

  return (
    <Notice
      Icon={Layers}
      title={t(limit === null ? copy.blockedTitle : copy.title)}
      body={t(limit === null ? copy.blocked : copy.reached, { used, limit })}
    />
  );
}
