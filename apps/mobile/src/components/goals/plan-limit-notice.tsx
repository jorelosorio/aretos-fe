import { Info, Layers } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack } from 'tamagui';

import { Notice } from '@/components/common/notice';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { Allowance } from '@/features/limits';
import { useTranslations } from '@/lib/i18n';

export function PlanLimitNotice({ allowance }: { allowance: Allowance }) {
  const { t } = useTranslations();
  const { known, canCreate, used, limit } = allowance;

  if (!known) return null;
  if (limit === null && canCreate) return null;

  if (canCreate) {
    return (
      <XStack items="center" gap={SPACING.group} px="$2">
        <Info size={ICON.inline} color="$mutedForeground" />
        <Paragraph flex={1} size={TEXT.caption} color="$mutedForeground">
          {t('goals.limit.usage', { used, limit })}
        </Paragraph>
      </XStack>
    );
  }

  return (
    <Notice
      Icon={Layers}
      title={t(
        limit === null ? 'goals.limit.blockedTitle' : 'goals.limit.title',
      )}
      body={t(limit === null ? 'goals.limit.blocked' : 'goals.limit.reached', {
        used,
        limit,
      })}
    />
  );
}
