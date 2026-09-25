import { useRef, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Archive } from '@tamagui/lucide-icons-2';
import { Paragraph, ScrollView, SizableText, XStack, YStack } from 'tamagui';

import { longDateLabel } from '@/components/common/date-label';
import { ErrorNotice } from '@/components/common/error-notice';
import { NOTE_TEXT } from '@/components/common/note-text';
import { ScreenLoader } from '@/components/common/screen-loader';
import { CompletionStatus } from '@/components/goals/completion-status';
import { GoalDot } from '@/components/goals/goal-dot';
import { PeriodMood } from '@/components/logs/period-mood';
import { TagChips } from '@/components/tags/tag-chips';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import { useNote, useNoteErrorMessage } from '@/features/diary';
import { useTranslations } from '@/lib/i18n';

import { periodLabel } from './diary-date';
import { NoteActionsMenu } from './note-actions-menu';
import { NoteComposer } from './note-composer';

const MOOD_FACE = 28;

type Composer = { session: number; open: boolean };

export function NoteReaderScreen({ id }: { id: string }) {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toMessage = useNoteErrorMessage();
  const { data: note, error } = useNote(id);

  const [composer, setComposer] = useState<Composer | null>(null);
  const sessions = useRef(0);

  if (!note && error) return <ErrorNotice message={toMessage(error)} />;
  if (!note) return <ScreenLoader />;

  const { checkIn } = note;
  const readOnly = checkIn?.goal.archived === true;

  const edit = () => {
    sessions.current += 1;
    setComposer({ session: sessions.current, open: true });
  };

  const filterBy = (tag: string) =>
    router.dismissTo({ pathname: '/diary', params: { tag } });

  return (
    <>
      <Stack.Screen
        options={{
          title:
            checkIn === null
              ? longDateLabel(note.entryDate, locale)
              : checkIn.goal.name,
          headerRight: readOnly
            ? undefined
            : () => <NoteActionsMenu note={note} onEdit={edit} />,
        }}
      />

      <ScrollView
        flex={1}
        bg="$background"
        contentContainerStyle={{ pb: insets.bottom }}
      >
        <YStack p={SPACING.screen} gap={SPACING.section}>
          {checkIn !== null && (
            <XStack items="center" gap={SPACING.items}>
              <YStack flex={1} minW={0} gap={SPACING.text}>
                <XStack items="center" gap="$1.5">
                  <GoalDot slot={checkIn.goal.colorSlot} size={8} />
                  <SizableText
                    shrink={1}
                    size={TEXT.caption}
                    color="$mutedForeground"
                    numberOfLines={1}
                  >
                    {periodLabel(note.entryDate, checkIn.endDate, locale)}
                  </SizableText>
                </XStack>

                {checkIn.total > 0 && (
                  <CompletionStatus
                    status={checkIn.status}
                    answered={checkIn.answered}
                    total={checkIn.total}
                  />
                )}
              </YStack>

              <PeriodMood mood={checkIn.mood} size={MOOD_FACE} active />
            </XStack>
          )}

          <Paragraph
            size={NOTE_TEXT.size}
            lineHeight={NOTE_TEXT.lineHeight}
            color="$color"
            selectable
          >
            {note.body}
          </Paragraph>

          <TagChips tags={note.tags} onPress={filterBy} />

          {readOnly && (
            <XStack items="center" gap="$2">
              <Archive size={ICON.inline} color="$mutedForeground" />
              <SizableText
                flex={1}
                size={TEXT.caption}
                color="$mutedForeground"
              >
                {t('diary.viewer.archived')}
              </SizableText>
            </XStack>
          )}
        </YStack>
      </ScrollView>

      {composer !== null && (
        <NoteComposer
          key={composer.session}
          note={note}
          open={composer.open}
          onClose={() =>
            setComposer((current) =>
              current === null ? null : { ...current, open: false },
            )
          }
        />
      )}
    </>
  );
}
