import { useEffect, useState } from 'react';
import { Plus, X } from '@tamagui/lucide-icons-2';
import { Input, SizableText, XStack, YStack } from 'tamagui';

import { ICON, SPACING, TEXT } from '@/constants/layout';
import {
  TAGS_MAX,
  TAG_MAX_LENGTH,
  addTag,
  removeTag,
  useTags,
} from '@/features/tags';
import { useTranslations } from '@/lib/i18n';

const SUGGESTIONS = 8;
const DEBOUNCE_MS = 250;

function useDebounced(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function SuggestionChip({
  label,
  accessibilityLabel,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <XStack
      items="center"
      gap="$1"
      px="$2.5"
      py="$1"
      rounded={999}
      borderWidth={1}
      borderColor="$border"
      onPress={onPress}
      pressStyle={{ bg: '$cardPress' }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Plus size={ICON.inline} color="$mutedForeground" />
      <SizableText size={TEXT.caption} color="$color">
        {label}
      </SizableText>
    </XStack>
  );
}

export function TagInput({
  value,
  onChange,
  text,
  onTextChange: setText,
}: {
  value: readonly string[];
  onChange: (tags: string[]) => void;
  text: string;
  onTextChange: (text: string) => void;
}) {
  const { t } = useTranslations();
  const query = useDebounced(text.trim(), DEBOUNCE_MS);
  const { data } = useTags(query, { limit: SUGGESTIONS + value.length });

  const taken = new Set(value.map((tag) => tag.toLowerCase()));
  const typed = text.trim();

  const suggestions = (data ?? [])
    .filter((tag) => !taken.has(tag.name.toLowerCase()))
    .filter((tag) => query !== '' || tag.uses > 0)
    .slice(0, SUGGESTIONS);

  const canCreate =
    typed !== '' &&
    !taken.has(typed.toLowerCase()) &&
    !suggestions.some((tag) => tag.name.toLowerCase() === typed.toLowerCase());

  const add = (name: string) => {
    onChange(addTag(value, name));
    setText('');
  };

  const changeText = (next: string) => {
    const parts = next.split(',');

    if (parts.length === 1) {
      setText(next);
      return;
    }

    onChange(
      parts
        .slice(0, -1)
        .reduce<string[]>((tags, part) => addTag(tags, part), [...value]),
    );
    setText(parts[parts.length - 1]);
  };

  return (
    <YStack gap={SPACING.group}>
      {value.length > 0 && (
        <XStack flexWrap="wrap" gap="$1.5">
          {value.map((tag) => (
            <XStack
              key={tag}
              items="center"
              gap="$1"
              pl="$2.5"
              pr="$1.5"
              py="$1"
              rounded={999}
              bg="$muted"
              onPress={() => onChange(removeTag(value, tag))}
              pressStyle={{ opacity: 0.7 }}
              accessibilityRole="button"
              accessibilityLabel={t('tags.remove', { name: tag })}
            >
              <SizableText size={TEXT.caption} color="$color">
                {tag}
              </SizableText>
              <X size={ICON.inline} color="$mutedForeground" />
            </XStack>
          ))}
        </XStack>
      )}

      {value.length >= TAGS_MAX ? (
        <SizableText size={TEXT.caption} color="$mutedForeground">
          {t('tags.full', { count: value.length, max: TAGS_MAX })}
        </SizableText>
      ) : (
        <>
          <Input
            size="$4"
            value={text}
            onChangeText={changeText}
            onSubmitEditing={() => add(text)}
            submitBehavior="submit"
            returnKeyType="done"
            placeholder={t('tags.placeholder')}
            placeholderTextColor="$mutedForeground"
            maxLength={TAG_MAX_LENGTH}
            autoCapitalize="none"
            autoCorrect={false}
            bg="$card"
            borderColor="$border"
            accessibilityLabel={t('tags.label')}
          />

          {(suggestions.length > 0 || canCreate) && (
            <XStack flexWrap="wrap" gap="$1.5">
              {suggestions.map((tag) => (
                <SuggestionChip
                  key={tag.id}
                  label={tag.name}
                  accessibilityLabel={t('tags.add', { name: tag.name })}
                  onPress={() => add(tag.name)}
                />
              ))}

              {canCreate && (
                <SuggestionChip
                  label={t('tags.create', { name: typed })}
                  accessibilityLabel={t('tags.create', { name: typed })}
                  onPress={() => add(typed)}
                />
              )}
            </XStack>
          )}
        </>
      )}
    </YStack>
  );
}
