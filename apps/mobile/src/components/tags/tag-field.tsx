import { Label, SizableText, YStack } from 'tamagui';

import { SPACING, TEXT } from '@/constants/layout';
import { TAGS_MAX } from '@/features/tags';
import { useTranslations } from '@/lib/i18n';

import type { TagDraft } from './tag-draft';
import { TagInput } from './tag-input';

export function TagField({
  draft,
  label,
}: {
  draft: TagDraft;
  label?: string;
}) {
  const { t } = useTranslations();
  const count = draft.tags.length;

  return (
    <YStack gap={SPACING.group}>
      <Label color="$color">{label ?? t('tags.label')}</Label>

      <TagInput
        value={draft.tags}
        onChange={draft.setTags}
        text={draft.text}
        onTextChange={draft.setText}
      />

      <SizableText
        size={TEXT.caption}
        color="$mutedForeground"
        px="$2"
        text="right"
        accessibilityLabel={t('tags.full', { count, max: TAGS_MAX })}
        accessibilityLiveRegion="polite"
      >
        {`${count} / ${TAGS_MAX}`}
      </SizableText>
    </YStack>
  );
}
