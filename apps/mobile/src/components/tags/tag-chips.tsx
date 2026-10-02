import { SizableText, XStack } from 'tamagui';

import { TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';
import { capitalize } from '@/utils/text';

import { TagChip } from './tag-chip';

export function TagChips({
  tags,
  max,
  onPress,
}: {
  tags: readonly string[];
  max?: number;
  onPress?: (tag: string) => void;
}) {
  const { t } = useTranslations();

  if (tags.length === 0) return null;

  const shown = max === undefined ? tags : tags.slice(0, max);
  const hidden = tags.length - shown.length;

  return (
    <XStack flexWrap="wrap" items="center" gap="$1.5">
      {shown.map((tag) => (
        <TagChip
          key={tag}
          label={tag}
          onPress={onPress === undefined ? undefined : () => onPress(tag)}
          accessibilityLabel={
            onPress === undefined
              ? capitalize(tag)
              : t('tags.filterBy', { name: capitalize(tag) })
          }
        />
      ))}

      {hidden > 0 && (
        <XStack
          px="$2"
          py="$1"
          rounded={999}
          bg="$muted"
          accessibilityLabel={t('tags.moreLabel', { count: hidden })}
        >
          <SizableText size={TEXT.caption} color="$mutedForeground">
            {t('tags.more', { count: hidden })}
          </SizableText>
        </XStack>
      )}
    </XStack>
  );
}
