import { Search } from '@tamagui/lucide-icons-2/icons/Search';
import { X } from '@tamagui/lucide-icons-2/icons/X';
import { Input, XStack, YStack } from 'tamagui';

import { FIELD } from '@/components/common/form-field';
import { HIT_SLOP, ICON } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

const MAX_QUERY = 100;

export function TemplateSearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslations();

  return (
    <XStack
      items="center"
      gap="$2"
      px="$3"
      borderWidth={1}
      bg={FIELD.bg}
      borderColor={FIELD.borderColor}
      rounded={FIELD.rounded}
    >
      <Search size={ICON.row} color="$mutedForeground" />

      <Input
        flex={1}
        unstyled
        size="$4"
        py="$2.5"
        color="$color"
        value={value}
        onChangeText={onChange}
        placeholder={t('templates.search')}
        placeholderTextColor="$fieldPlaceholder"
        accessibilityLabel={t('templates.search')}
        maxLength={MAX_QUERY}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />

      {value !== '' && (
        <YStack
          onPress={() => onChange('')}
          hitSlop={HIT_SLOP}
          pressStyle={{ opacity: 0.6 }}
          accessibilityRole="button"
          accessibilityLabel={t('templates.clearSearch')}
        >
          <X size={ICON.row} color="$mutedForeground" />
        </YStack>
      )}
    </XStack>
  );
}
