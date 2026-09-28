import { useRef, useState } from 'react';
import type { View } from 'react-native';
import {
  KeyboardAvoidingView,
  useKeyboardState,
} from 'react-native-keyboard-controller';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@tamagui/core';
import {
  SizableText,
  TextArea,
  XStack,
  YStack,
  type ColorTokens,
} from 'tamagui';

import { DatePill, DateSheet } from '@/components/common/date-pill';
import { ErrorNotice } from '@/components/common/error-notice';
import { FormCounter } from '@/components/common/form-section';
import { NOTE_TEXT } from '@/components/common/note-text';
import { TagInput } from '@/components/tags/tag-input';
import { SPACING, TEXT } from '@/constants/layout';
import { NOTE_BODY_MAX } from '@/features/diary/types';
import { todayKey, type DateKey } from '@/features/logs/period';
import { TAGS_MAX } from '@/features/tags/rules';
import { useProfile } from '@/features/user/hooks';
import { useTranslations } from '@/lib/i18n';

import type { useNoteDraft } from './note-draft';
import { useRevealCaret } from './use-reveal-caret';

const COUNTER_BELOW = 100;
const TAG_COUNT_FROM = TAGS_MAX - 5;
const COUNTER_ROOM = 44;

export function NoteForm({
  draft,
  period,
  error,
  autoFocus,
  padBottom = true,
}: {
  draft: ReturnType<typeof useNoteDraft>;
  period?: string;
  error: string | null;
  autoFocus: boolean;
  padBottom?: boolean;
}) {
  const { t } = useTranslations();
  const theme = useTheme();
  const { data: profile } = useProfile();
  const insets = useSafeAreaInsets();
  const [picking, setPicking] = useState(false);
  const [bodyHeight, setBodyHeight] = useState(0);
  const frameRef = useRef<View>(null);
  const [frameTop, setFrameTop] = useState(0);
  const { scrollRef, bodyBox, bodyRef, onBodyLayout } = useRevealCaret(
    NOTE_TEXT.lineHeight,
  );

  const surface = theme.background.val as ColorTokens;
  const today = todayKey();
  const { entryDate } = draft;
  const createdOn: DateKey =
    profile?.createdAt.slice(0, 10) ?? entryDate ?? today;
  const tagCount = draft.tags.tags.length;
  const charactersLeft = NOTE_BODY_MAX - draft.body.length;
  const counting = charactersLeft < COUNTER_BELOW;
  const keyboardOpen = useKeyboardState((state) => state.isVisible);
  const bottomInset = padBottom && !keyboardOpen ? insets.bottom : 0;

  return (
    <KeyboardAvoidingView
      ref={frameRef}
      behavior="padding"
      keyboardVerticalOffset={frameTop}
      onLayout={() =>
        frameRef.current?.measureInWindow((_x, y) => setFrameTop(y))
      }
      style={{ flex: 1, backgroundColor: surface }}
    >
      <YStack flex={1}>
        <Animated.ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom:
              (padBottom ? insets.bottom : 0) + (counting ? COUNTER_ROOM : 0),
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {error !== null && (
            <YStack px={SPACING.screen} pt={SPACING.screen}>
              <ErrorNotice message={error} />
            </YStack>
          )}

          <YStack px={SPACING.screen} pt={SPACING.group} gap={SPACING.text}>
            {entryDate !== null ? (
              <DatePill
                value={entryDate}
                today={today}
                active={picking}
                onPress={() => setPicking(true)}
              />
            ) : (
              period !== undefined && (
                <SizableText size={TEXT.caption} color="$mutedForeground">
                  {period}
                </SizableText>
              )
            )}

            <TagInput
              bare
              value={draft.tags.tags}
              onChange={draft.tags.setTags}
              text={draft.tags.text}
              onTextChange={draft.tags.setText}
            />

            {tagCount >= TAG_COUNT_FROM && (
              <FormCounter
                count={tagCount}
                max={TAGS_MAX}
                label={t('tags.full', { count: tagCount, max: TAGS_MAX })}
              />
            )}
          </YStack>

          <Animated.View ref={bodyBox} style={{ flexGrow: 1 }}>
            <TextArea
              ref={bodyRef}
              onLayout={onBodyLayout}
              unstyled
              fontFamily="$body"
              grow={1}
              minH={bodyHeight}
              onContentSizeChange={(event) =>
                setBodyHeight(Math.ceil(event.nativeEvent.contentSize.height))
              }
              size={NOTE_TEXT.size}
              lineHeight={NOTE_TEXT.lineHeight}
              color={theme.color.val as ColorTokens}
              value={draft.body}
              onChangeText={draft.setBody}
              placeholder={t('diary.editor.placeholder')}
              placeholderTextColor={theme.fieldPlaceholder.val as ColorTokens}
              accessibilityLabel={t('diary.editor.body')}
              maxLength={NOTE_BODY_MAX}
              multiline
              scrollEnabled={false}
              autoFocusNative={autoFocus}
              verticalAlign="top"
              p={NOTE_TEXT.padding}
              bg={surface}
              borderWidth={0}
              rounded={0}
              focusStyle={{ borderWidth: 0, bg: surface }}
            />
          </Animated.View>
        </Animated.ScrollView>

        {counting && (
          <XStack
            position="absolute"
            b={bottomInset}
            l={0}
            r={0}
            pb={SPACING.group}
            justify="center"
            pointerEvents="none"
          >
            <SizableText
              px="$3"
              py="$1.5"
              rounded={999}
              bg={charactersLeft <= 0 ? '$destructive' : '$color'}
              size={TEXT.caption}
              fontWeight="600"
              color={
                charactersLeft <= 0 ? '$destructiveForeground' : '$background'
              }
              accessibilityLiveRegion="polite"
            >
              {t(
                charactersLeft === 1
                  ? 'diary.editor.charactersLeftOne'
                  : 'diary.editor.charactersLeftMany',
                { count: charactersLeft },
              )}
            </SizableText>
          </XStack>
        )}
      </YStack>

      {entryDate !== null && (
        <DateSheet
          open={picking}
          value={entryDate}
          today={today}
          min={createdOn < entryDate ? createdOn : entryDate}
          max={today}
          onPick={(day) => {
            draft.setEntryDate(day);
            setPicking(false);
          }}
          onDismiss={() => setPicking(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
}
