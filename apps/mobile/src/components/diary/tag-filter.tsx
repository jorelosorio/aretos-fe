import { YStack } from 'tamagui';

import { ChipFilter } from '@/components/common/chip-filter';
import { tagMark } from '@/components/tags/tag-chip';
import { SPACING } from '@/constants/layout';
import { useTags } from '@/features/tags';
import { useTranslations } from '@/lib/i18n';
import { capitalize } from '@/utils/text';

const FILTER_TAGS = 50;

export function TagFilter({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (tag: string | null) => void;
}) {
  const { t } = useTranslations();
  const { data } = useTags('', { limit: FILTER_TAGS });

  const used = (data ?? [])
    .filter((tag) => tag.uses > 0)
    .map((tag) => tag.name);
  const active = value?.toLowerCase() ?? null;
  const names =
    value !== null && !used.some((name) => name.toLowerCase() === active)
      ? [value, ...used]
      : used;

  if (names.length === 0) return null;

  return (
    <YStack px={SPACING.screen} py={SPACING.group}>
      <ChipFilter
        items={names.map((name) => ({
          key: name.toLowerCase(),
          label: capitalize(name),
          leading: tagMark,
        }))}
        value={active}
        onChange={(key) =>
          onChange(
            key === null
              ? null
              : (names.find((name) => name.toLowerCase() === key) ?? key),
          )
        }
        allLabel={t('diary.filter.all')}
      />
    </YStack>
  );
}
