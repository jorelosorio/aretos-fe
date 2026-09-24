import { Info, Layers } from '@tamagui/lucide-icons-2';
import { Paragraph, SizableText, XStack, YStack } from 'tamagui';

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
    <XStack
      gap={SPACING.items}
      p={SPACING.card}
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
    >
      <YStack
        width={36}
        height={36}
        items="center"
        justify="center"
        rounded="$xl"
        bg="$muted"
      >
        <Layers size={ICON.row} color="$primary" />
      </YStack>

      <YStack flex={1} gap={SPACING.text}>
        <SizableText
          size={TEXT.heading}
          fontWeight="700"
          color="$cardForeground"
        >
          {t(limit === null ? 'goals.limit.blockedTitle' : 'goals.limit.title')}
        </SizableText>
        <Paragraph size={TEXT.body} color="$mutedForeground">
          {t(limit === null ? 'goals.limit.blocked' : 'goals.limit.reached', {
            used,
            limit,
          })}
        </Paragraph>
      </YStack>
    </XStack>
  );
}
