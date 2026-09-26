import { useEffect, useRef, useState } from 'react';
import { Plus } from '@tamagui/lucide-icons-2';
import {
  Input,
  SizableText,
  XStack,
  YStack,
  type TamaguiElement,
} from 'tamagui';

import { ICON, SPACING, TEXT } from '@/constants/layout';
import {
  TAGS_MAX,
  TAG_MAX_LENGTH,
  addTag,
  removeTag,
  useTags,
} from '@/features/tags';
import { useTranslations } from '@/lib/i18n';
import { capitalize } from '@/utils/text';

import { TagChip } from './tag-chip';

const SUGGESTIONS = 8;
const DEBOUNCE_MS = 250;
const INPUT_MIN_WIDTH = 120;
const INPUT_HEIGHT = 32;

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
  const inputRef = useRef<TamaguiElement>(null);
  const [focused, setFocused] = useState(false);
  const [armed, setArmed] = useState(false);

  const query = useDebounced(text.trim(), DEBOUNCE_MS);
  const { data } = useTags(query, { limit: SUGGESTIONS + value.length });

  const full = value.length >= TAGS_MAX;
  const taken = new Set(value.map((tag) => tag.toLowerCase()));
  const typed = text.trim();
  const last = value[value.length - 1];

  const suggestions = (data ?? [])
    .filter((tag) => !taken.has(tag.name.toLowerCase()))
    .filter((tag) => query !== '' || tag.uses > 0)
    .slice(0, SUGGESTIONS);

  const canCreate =
    typed !== '' &&
    !taken.has(typed.toLowerCase()) &&
    !suggestions.some((tag) => tag.name.toLowerCase() === typed.toLowerCase());

  const showSuggestions =
    !full && (focused || typed !== '') && (suggestions.length > 0 || canCreate);

  const add = (name: string) => {
    onChange(addTag(value, name));
    setText('');
    setArmed(false);
  };

  const changeText = (next: string) => {
    setArmed(false);
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

  const backspace = () => {
    if (text !== '' || last === undefined) return;
    if (!armed) {
      setArmed(true);
      return;
    }
    onChange(removeTag(value, last));
    setArmed(false);
  };

  const blur = () => {
    setFocused(false);
    setArmed(false);
    if (typed !== '') add(typed);
  };

  return (
    <YStack gap={SPACING.group}>
      <XStack
        flexWrap="wrap"
        items="center"
        gap="$1.5"
        px="$3"
        py="$2"
        minH={INPUT_HEIGHT + 20}
        bg="$card"
        rounded="$xl"
        borderWidth={1}
        borderColor={focused ? '$primary' : '$border'}
        onPress={() => inputRef.current?.focus()}
      >
        {value.map((tag, index) => (
          <TagChip
            key={tag}
            label={tag}
            size="regular"
            highlighted={armed && index === value.length - 1}
            removeLabel={t('tags.remove', { name: capitalize(tag) })}
            onRemove={() => {
              setArmed(false);
              onChange(removeTag(value, tag));
            }}
          />
        ))}

        {!full && (
          <Input
            ref={inputRef}
            unstyled
            flex={1}
            minW={INPUT_MIN_WIDTH}
            height={INPUT_HEIGHT}
            size="$4"
            color="$color"
            value={text}
            onChangeText={changeText}
            onKeyPress={(event) => {
              if (event.nativeEvent.key === 'Backspace') backspace();
            }}
            onFocus={() => setFocused(true)}
            onBlur={blur}
            onSubmitEditing={() => add(text)}
            submitBehavior="submit"
            returnKeyType="done"
            placeholder={t('tags.placeholder')}
            placeholderTextColor="$mutedForeground"
            maxLength={TAG_MAX_LENGTH}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel={t('tags.label')}
          />
        )}
      </XStack>

      {showSuggestions && (
        <XStack flexWrap="wrap" gap="$1.5">
          {suggestions.map((tag) => (
            <SuggestionChip
              key={tag.id}
              label={capitalize(tag.name)}
              accessibilityLabel={t('tags.add', { name: capitalize(tag.name) })}
              onPress={() => add(tag.name)}
            />
          ))}

          {canCreate && (
            <SuggestionChip
              label={t('tags.create', { name: capitalize(typed) })}
              accessibilityLabel={t('tags.create', { name: capitalize(typed) })}
              onPress={() => add(typed)}
            />
          )}
        </XStack>
      )}
    </YStack>
  );
}
