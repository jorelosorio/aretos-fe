import { Label, SizableText, TextArea, YStack } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { FormScrollView } from '@/components/common/form-scroll-view';
import { WeekPicker } from '@/components/logs/week-picker';
import { TagField } from '@/components/tags/tag-field';
import { SPACING, TEXT } from '@/constants/layout';
import { NOTE_BODY_MAX } from '@/features/diary';
import { todayKey, type DateKey } from '@/features/logs';
import { useProfile } from '@/features/user';
import { useTranslations } from '@/lib/i18n';

import type { useNoteDraft } from './note-draft';

const BODY_MIN_HEIGHT = 200;
const NO_PERIODS = [] as const;

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
  const { data: profile } = useProfile();

  const today = todayKey();
  const { entryDate } = draft;
  const createdOn: DateKey =
    profile?.createdAt.slice(0, 10) ?? entryDate ?? today;

  return (
    <FormScrollView padBottom={padBottom}>
      <YStack p={SPACING.screen} gap={SPACING.section}>
        <ErrorNotice message={error} />

        {(entryDate !== null || period !== undefined) && (
          <YStack gap={SPACING.group}>
            <Label color="$color">{t('diary.editor.date')}</Label>
            {entryDate !== null ? (
              <WeekPicker
                frequency="daily"
                periods={NO_PERIODS}
                selected={entryDate}
                today={today}
                createdOn={createdOn}
                onSelect={draft.setEntryDate}
              />
            ) : (
              <SizableText size={TEXT.body} color="$mutedForeground" px="$2">
                {period}
              </SizableText>
            )}
          </YStack>
        )}

        <YStack gap={SPACING.group}>
          <Label htmlFor="note-body" color="$color">
            {t('diary.editor.body')}
          </Label>
          <TextArea
            id="note-body"
            size="$5"
            value={draft.body}
            onChangeText={draft.setBody}
            placeholder={t('diary.editor.placeholder')}
            placeholderTextColor="$mutedForeground"
            maxLength={NOTE_BODY_MAX}
            multiline
            autoFocus={autoFocus}
            minH={BODY_MIN_HEIGHT}
            verticalAlign="top"
            bg="$card"
            borderColor="$border"
          />
          <SizableText
            size={TEXT.caption}
            color="$mutedForeground"
            px="$2"
            text="right"
          >
            {`${draft.body.length} / ${NOTE_BODY_MAX}`}
          </SizableText>
        </YStack>

        <TagField
          value={draft.tags}
          onChange={draft.setTags}
          text={draft.tagText}
          onTextChange={draft.setTagText}
        />
      </YStack>
    </FormScrollView>
  );
}
