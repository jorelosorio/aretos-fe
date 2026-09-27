import { FormSection } from '@/components/common/form-section';
import { TAGS_MAX } from '@/features/tags/rules';
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
    <FormSection
      title={label ?? t('tags.label')}
      counter={{
        count,
        max: TAGS_MAX,
        label: t('tags.full', { count, max: TAGS_MAX }),
      }}
    >
      <TagInput
        value={draft.tags}
        onChange={draft.setTags}
        text={draft.text}
        onTextChange={draft.setText}
      />
    </FormSection>
  );
}
