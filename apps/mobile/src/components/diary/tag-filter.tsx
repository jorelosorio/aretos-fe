import { useState } from 'react';
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons-2';
import { SizableText, XStack } from 'tamagui';

import { ICON, SPACING, TEXT } from '@/constants/layout';
import { useTags } from '@/features/tags';
import { TagChip } from '@/components/tags/tag-chip';
import { useTranslations } from '@/lib/i18n';

import { visibleTags } from './tag-filter-items';

const FILTER_TAGS = 50;
const COLLAPSED_TAGS = 10;

function ToggleChip({
  label,
  expanded,
  onPress,
}: {
  label: string;
  expanded: boolean;
  onPress: () => void;
}) {
  const Icon = expanded ? ChevronUp : ChevronDown;

  return (
    <XStack
      items="center"
      gap="$1"
      px="$2.5"
      py="$1"
      rounded={999}
      bg="$secondary"
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={label}
    >
      <SizableText
        size={TEXT.caption}
        fontWeight="600"
        color="$secondaryForeground"
      >
        {label}
      </SizableText>
      <Icon size={ICON.inline} color="$secondaryForeground" />
    </XStack>
  );
}

export function TagFilter({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (tag: string | null) => void;
}) {
  const { t } = useTranslations();
  const { data } = useTags('', { limit: FILTER_TAGS });
  const [expanded, setExpanded] = useState(false);

  const used = (data ?? [])
    .filter((tag) => tag.uses > 0)
    .map((tag) => tag.name);
  const isActive = (name: string) =>
    value !== null && name.toLowerCase() === value.toLowerCase();
  const names =
    value !== null && !used.some(isActive) ? [value, ...used] : used;

  if (names.length === 0) return null;

  const { shown, hidden } = visibleTags(names, value, expanded, COLLAPSED_TAGS);

  return (
    <XStack
      flexWrap="wrap"
      items="center"
      gap="$1.5"
      px={SPACING.screen}
      py={SPACING.group}
    >
      <TagChip
        label={t('diary.filter.all')}
        icon={false}
        selected={value === null}
        onPress={() => onChange(null)}
      />
      {shown.map((name) => (
        <TagChip
          key={name}
          label={name}
          selected={isActive(name)}
          onPress={() => onChange(isActive(name) ? null : name)}
        />
      ))}

      {hidden > 0 && (
        <ToggleChip
          label={t('diary.filter.more', { count: hidden })}
          expanded={false}
          onPress={() => setExpanded(true)}
        />
      )}

      {expanded && names.length > COLLAPSED_TAGS && (
        <ToggleChip
          label={t('diary.filter.less')}
          expanded
          onPress={() => setExpanded(false)}
        />
      )}
    </XStack>
  );
}
