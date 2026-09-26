import { Info } from '@tamagui/lucide-icons-2';
import { Label, SizableText, XStack, YStack } from 'tamagui';

import { ICON, SPACING, TEXT } from '@/constants/layout';
import { TAGS_MAX } from '@/features/tags';
import { useTranslations } from '@/lib/i18n';

import { TagInput } from './tag-input';

export function TagField({
  value,
  onChange,
  text,
  onTextChange,
  label,
  hint,
}: {
  value: readonly string[];
  onChange: (tags: string[]) => void;
  text: string;
  onTextChange: (text: string) => void;
  label?: string;
  hint?: string;
}) {
  const { t } = useTranslations();

  return (
    <YStack gap={SPACING.group}>
      <Label color="$color">{label ?? t('tags.label')}</Label>

      <TagInput
        value={value}
        onChange={onChange}
        text={text}
        onTextChange={onTextChange}
      />

      <XStack items="flex-start" gap={SPACING.items} px="$2">
        <XStack flex={1} items="flex-start" gap="$1.5">
          {hint !== undefined && (
            <>
              <Info size={ICON.inline} color="$mutedForeground" mt={2} />
              <SizableText
                flex={1}
                size={TEXT.caption}
                color="$mutedForeground"
              >
                {hint}
              </SizableText>
            </>
          )}
        </XStack>

        <SizableText
          size={TEXT.caption}
          color="$mutedForeground"
          accessibilityLabel={t('tags.full', {
            count: value.length,
            max: TAGS_MAX,
          })}
          accessibilityLiveRegion="polite"
        >
          {`${value.length} / ${TAGS_MAX}`}
        </SizableText>
      </XStack>
    </YStack>
  );
}
