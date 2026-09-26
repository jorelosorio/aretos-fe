import { useState } from 'react';
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons-2';
import { SizableText, XStack } from 'tamagui';

import { ICON, TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

import { Chip, type ChipLeading } from './chip';
import { visibleItems } from './chip-filter-items';

const COLLAPSED_ITEMS = 10;

export type ChipFilterItem = {
  key: string;
  label: string;
  leading?: ChipLeading;
};

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
      borderWidth={1}
      borderColor="$primary"
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={label}
    >
      <SizableText size={TEXT.caption} fontWeight="600" color="$primary">
        {label}
      </SizableText>
      <Icon size={ICON.inline} color="$primary" />
    </XStack>
  );
}

export function ChipFilter({
  items,
  value,
  onChange,
  allLabel,
}: {
  items: readonly ChipFilterItem[];
  value: string | null;
  onChange: (key: string | null) => void;
  allLabel: string;
}) {
  const { t } = useTranslations();
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const { shown, hidden } = visibleItems(
    items.map((item) => item.key),
    value,
    expanded,
    COLLAPSED_ITEMS,
  );

  return (
    <XStack flexWrap="wrap" items="center" gap="$1.5">
      <Chip
        label={allLabel}
        selected={value === null}
        onPress={() => onChange(null)}
      />

      {items
        .filter((item) => shown.includes(item.key))
        .map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            leading={item.leading}
            selected={value === item.key}
            onPress={() => onChange(value === item.key ? null : item.key)}
          />
        ))}

      {hidden > 0 && (
        <ToggleChip
          label={t('filter.more', { count: hidden })}
          expanded={false}
          onPress={() => setExpanded(true)}
        />
      )}

      {expanded && items.length > COLLAPSED_ITEMS && (
        <ToggleChip
          label={t('filter.less')}
          expanded
          onPress={() => setExpanded(false)}
        />
      )}
    </XStack>
  );
}
