import { useState } from 'react';
import { useTheme } from '@tamagui/core';
import { SizableText, TextArea, YStack, type ColorTokens } from 'tamagui';

import { DatePill, DateSheet } from '@/components/common/date-pill';
import { ErrorNotice } from '@/components/common/error-notice';
import { FormScrollView } from '@/components/common/form-scroll-view';
import { NOTE_TEXT } from '@/components/common/note-text';
import { TagInput } from '@/components/tags/tag-input';
import { SPACING, TEXT } from '@/constants/layout';
import { NOTE_BODY_MAX } from '@/features/diary';
import { todayKey, type DateKey } from '@/features/logs';
import { TAGS_MAX } from '@/features/tags';
import { useProfile } from '@/features/user';
import { useTranslations } from '@/lib/i18n';

import type { useNoteDraft } from './note-draft';

const BODY_MIN_HEIGHT = 240;
const BODY_COUNT_FROM = NOTE_BODY_MAX - 200;
const TAG_COUNT_FROM = TAGS_MAX - 5;

function Count({
  count,
  max,
  label,
}: {
  count: number;
  max: number;
  label?: string;
}) {
  return (
    <SizableText
      size={TEXT.caption}
      color={count >= max ? '$destructive' : '$mutedForeground'}
      text="right"
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
    >
      {`${count} / ${max}`}
    </SizableText>
  );
}

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
  const [picking, setPicking] = useState(false);

  const surface = theme.background.val as ColorTokens;
  const today = todayKey();
  const { entryDate } = draft;
  const createdOn: DateKey =
    profile?.createdAt.slice(0, 10) ?? entryDate ?? today;
  const tagCount = draft.tags.tags.length;

  return (
    <FormScrollView padBottom={padBottom}>
      <YStack flex={1}>
        <YStack px={SPACING.screen} pt={SPACING.screen} gap={SPACING.items}>
          <ErrorNotice message={error} />

          {entryDate !== null ? (
            <DatePill
              value={entryDate}
              today={today}
              active={picking}
              onPress={() => setPicking(true)}
            />
          ) : (
            period !== undefined && (
              <SizableText size={TEXT.body} color="$mutedForeground">
                {period}
              </SizableText>
            )
          )}

          <TagInput
            value={draft.tags.tags}
            onChange={draft.tags.setTags}
            text={draft.tags.text}
            onTextChange={draft.tags.setText}
          />

          {tagCount >= TAG_COUNT_FROM && (
            <Count
              count={tagCount}
              max={TAGS_MAX}
              label={t('tags.full', { count: tagCount, max: TAGS_MAX })}
            />
          )}
        </YStack>

        <TextArea
          flex={1}
          minH={BODY_MIN_HEIGHT}
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
          autoFocus={autoFocus}
          verticalAlign="top"
          p={NOTE_TEXT.padding}
          bg={surface}
          borderWidth={0}
          rounded={0}
          focusStyle={{ borderWidth: 0, bg: surface }}
        />

        {draft.body.length >= BODY_COUNT_FROM && (
          <YStack px={SPACING.screen} pb={SPACING.group}>
            <Count count={draft.body.length} max={NOTE_BODY_MAX} />
          </YStack>
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
    </FormScrollView>
  );
}
