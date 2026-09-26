import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Archive, ChevronRight } from '@tamagui/lucide-icons-2';
import { Paragraph, ScrollView, SizableText, XStack, YStack } from 'tamagui';

import { longDateLabel } from '@/components/common/date-label';
import { ErrorNotice } from '@/components/common/error-notice';
import { NOTE_TEXT } from '@/components/common/note-text';
import { ScreenLoader } from '@/components/common/screen-loader';
import { CompletionStatus } from '@/components/goals/completion-status';
import { GoalDot } from '@/components/goals/goal-dot';
import { MOOD_LABELS } from '@/components/logs/mood-labels';
import { PeriodMood } from '@/components/logs/period-mood';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import {
  useNote,
  useNoteErrorMessage,
  type DiaryCheckIn,
  type DiaryNote,
} from '@/features/diary';
import { useTranslations, type AppLocale } from '@/lib/i18n';
import { dateFormat } from '@/utils/date-format';

import { periodLabel, writtenOnEntryDay } from './diary-date';
import { NoteActionsMenu } from './note-actions-menu';
import { NoteMeta } from './note-meta';

const MOOD_FACE = 36;

function whenLabel(note: DiaryNote, locale: AppLocale) {
  const end = note.checkIn?.endDate ?? note.entryDate;
  if (end !== note.entryDate) return periodLabel(note.entryDate, end, locale);

  const day = longDateLabel(note.entryDate, locale);
  if (!writtenOnEntryDay(note.createdAt, note.entryDate)) return day;

  const time = dateFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(note.createdAt));

  return `${day}, ${time}`;
}

function ContextPill({
  checkIn,
  onPress,
}: {
  checkIn: DiaryCheckIn | null;
  onPress?: () => void;
}) {
  const { t } = useTranslations();

  return (
    <XStack
      items="center"
      gap="$1.5"
      px="$3"
      py="$1.5"
      rounded={999}
      bg="$muted"
      maxW={220}
      onPress={onPress}
      pressStyle={onPress === undefined ? undefined : { opacity: 0.7 }}
      accessibilityRole={onPress === undefined ? 'text' : 'button'}
    >
      {checkIn !== null && <GoalDot slot={checkIn.goal.colorSlot} size={8} />}
      <SizableText
        shrink={1}
        size={TEXT.body}
        fontWeight="600"
        color="$color"
        numberOfLines={1}
      >
        {checkIn === null ? t('diary.title') : checkIn.goal.name}
      </SizableText>
    </XStack>
  );
}

function CheckInCard({
  checkIn,
  onPress,
}: {
  checkIn: DiaryCheckIn;
  onPress?: () => void;
}) {
  const { t } = useTranslations();

  return (
    <XStack
      items="center"
      gap={SPACING.items}
      p={SPACING.card}
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
      onPress={onPress}
      pressStyle={onPress === undefined ? undefined : { bg: '$cardPress' }}
      accessibilityRole={onPress === undefined ? 'summary' : 'button'}
      accessibilityHint={
        onPress === undefined ? undefined : t('diary.viewer.openCheckIn')
      }
      accessibilityLabel={[
        t('diary.viewer.fromCheckIn'),
        checkIn.mood === null ? null : t(MOOD_LABELS[checkIn.mood]),
      ]
        .filter((part): part is string => part !== null)
        .join('. ')}
    >
      <PeriodMood mood={checkIn.mood} size={MOOD_FACE} active />

      <YStack flex={1} minW={0} gap={SPACING.text}>
        <SizableText size={TEXT.body} fontWeight="700" color="$cardForeground">
          {t('diary.viewer.fromCheckIn')}
        </SizableText>
        {checkIn.total > 0 && (
          <CompletionStatus
            status={checkIn.status}
            answered={checkIn.answered}
            total={checkIn.total}
          />
        )}
      </YStack>

      {onPress !== undefined && (
        <ChevronRight size={ICON.row} color="$mutedForeground" />
      )}
    </XStack>
  );
}

export function NoteReaderScreen({ id }: { id: string }) {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toMessage = useNoteErrorMessage();
  const { data: note, error } = useNote(id);

  if (!note && error) return <ErrorNotice message={toMessage(error)} />;
  if (!note) return <ScreenLoader />;

  const { checkIn } = note;
  const readOnly = checkIn?.goal.archived === true;

  const edit = () =>
    router.push({ pathname: '/diary/[id]/edit', params: { id: note.id } });

  const filterBy = (tag: string) =>
    router.dismissTo({ pathname: '/diary', params: { tag } });

  const openGoal =
    checkIn === null
      ? undefined
      : () =>
          router.push({
            pathname: '/goals/[id]',
            params: { id: checkIn.goal.id },
          });

  const openCheckIn = (target: DiaryCheckIn) =>
    router.push({
      pathname: '/goals/[id]/check-in',
      params: { id: target.goal.id, date: note.entryDate },
    });

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerTitleAlign: 'center',
          headerTitle: () => (
            <ContextPill checkIn={checkIn} onPress={openGoal} />
          ),
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
          <YStack gap={SPACING.group}>
            <Paragraph
              size={NOTE_TEXT.size}
              lineHeight={NOTE_TEXT.lineHeight}
              color="$color"
              selectable
            >
              {note.body}
            </Paragraph>

            <NoteMeta
              caption={whenLabel(note, locale)}
              tags={note.tags}
              onTagPress={filterBy}
            />
          </YStack>

          {checkIn !== null && (
            <CheckInCard
              checkIn={checkIn}
              onPress={readOnly ? undefined : () => openCheckIn(checkIn)}
            />
          )}

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
    </>
  );
}
