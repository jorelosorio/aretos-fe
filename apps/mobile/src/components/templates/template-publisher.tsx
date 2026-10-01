import { BadgeCheck } from '@tamagui/lucide-icons-2/icons/BadgeCheck';
import { SizableText, XStack } from 'tamagui';

import { ICON, TEXT } from '@/constants/layout';
import type { Template } from '@/features/templates/types';
import { useTranslations } from '@/lib/i18n';

export function TemplatePublisher({
  publisher,
}: {
  publisher: Template['publisher'];
}) {
  const { t } = useTranslations();

  return (
    <XStack
      items="center"
      gap="$1"
      shrink={1}
      accessibilityLabel={
        publisher.official
          ? t('templates.officialLabel', { name: publisher.name })
          : publisher.name
      }
    >
      {publisher.official && <BadgeCheck size={ICON.inline} color="$primary" />}
      <SizableText
        size={TEXT.caption}
        fontWeight="600"
        color={publisher.official ? '$primary' : '$mutedForeground'}
        numberOfLines={1}
        shrink={1}
      >
        {publisher.name}
      </SizableText>
    </XStack>
  );
}
