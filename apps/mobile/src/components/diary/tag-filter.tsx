import { ScrollView, SizableText, XStack } from 'tamagui';

import { SPACING, TEXT } from '@/constants/layout';
import { useTags } from '@/features/tags';
import { useTranslations } from '@/lib/i18n';

const FILTER_TAGS = 20;

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <XStack
      px="$3"
      py="$1.5"
      rounded={999}
      borderWidth={1}
      borderColor={active ? '$primary' : '$border'}
      bg={active ? '$primary' : '$card'}
      onPress={onPress}
      pressStyle={{ opacity: 0.8 }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <SizableText
        size={TEXT.caption}
        fontWeight="600"
        color={active ? '$primaryForeground' : '$color'}
      >
        {label}
      </SizableText>
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

  const used = (data ?? [])
    .filter((tag) => tag.uses > 0)
    .map((tag) => tag.name);
  const isActive = (name: string) =>
    value !== null && name.toLowerCase() === value.toLowerCase();
  const names =
    value !== null && !used.some(isActive) ? [value, ...used] : used;

  if (names.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      grow={0}
      contentContainerStyle={{
        px: SPACING.screen,
        py: SPACING.group,
        gap: '$1.5',
      }}
    >
      <FilterChip
        label={t('diary.filter.all')}
        active={value === null}
        onPress={() => onChange(null)}
      />
      {names.map((name) => (
        <FilterChip
          key={name}
          label={name}
          active={isActive(name)}
          onPress={() => onChange(isActive(name) ? null : name)}
        />
      ))}
    </ScrollView>
  );
}
