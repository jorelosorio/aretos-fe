import { SizableText, XStack, YStack } from 'tamagui';

import { Avatar } from '@/components/common/avatar';
import { Card } from '@/components/common/card';
import { SPACING, TEXT } from '@/constants/layout';
import type { Profile } from '@/features/user/types';
import { useTranslations } from '@/lib/i18n';

import { PlanChip } from './plan-chip';

export function ProfileSummary({
  profile,
  onPress,
}: {
  profile: Profile;
  onPress: () => void;
}) {
  const { t } = useTranslations();
  const title = profile.displayName || profile.email;

  return (
    <Card
      density="tight"
      pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={t('account.openProfile')}
    >
      <XStack items="center" gap={SPACING.items}>
        <Avatar name={title} url={profile.avatarUrl} />

        <YStack flex={1} minW={0} gap={SPACING.text}>
          <SizableText
            size={TEXT.subheading}
            fontWeight="700"
            color="$color"
            numberOfLines={1}
          >
            {title}
          </SizableText>
          {profile.displayName !== '' && (
            <SizableText
              size={TEXT.caption}
              color="$mutedForeground"
              numberOfLines={1}
            >
              {profile.email}
            </SizableText>
          )}
        </YStack>

        <PlanChip tier={profile.tier} />
      </XStack>
    </Card>
  );
}
