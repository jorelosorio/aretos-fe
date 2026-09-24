import { CalendarRange } from '@tamagui/lucide-icons-2';
import { SizableText, XStack } from 'tamagui';

import { shortDateLabel } from '@/components/common/date-label';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { MoodScore } from '@/features/logs';
import { useTranslations } from '@/lib/i18n';

import { PeriodMood } from './period-mood';

const MOOD_SIZE = 18;

export function WeekWindow({
  entryDate,
  endDate,
  daysLeft,
  mood,
}: {
  entryDate: string;
  endDate: string;
  daysLeft: number;
  mood: MoodScore | null;
}) {
  const { t, locale } = useTranslations();

  const range = `${shortDateLabel(entryDate, locale)} – ${shortDateLabel(
    endDate,
    locale,
  )}`;

  const lastDay = daysLeft === 1;

  return (
    <XStack
      items="center"
      justify="space-between"
      gap={SPACING.items}
      px="$3"
      py="$2.5"
      rounded="$lg"
      bg="$muted"
    >
      <XStack items="center" gap="$2" shrink={1}>
        <CalendarRange size={ICON.inline} color="$mutedForeground" />
        <SizableText
          size={TEXT.caption}
          color="$mutedForeground"
          numberOfLines={1}
        >
          {range}
        </SizableText>
      </XStack>

      <XStack items="center" gap="$2">
        <SizableText
          size={TEXT.caption}
          fontWeight="700"
          color={lastDay ? '$primary' : '$cardForeground'}
        >
          {lastDay
            ? t('home.daysLeftOne')
            : t('home.daysLeftMany', { count: daysLeft })}
        </SizableText>

        <PeriodMood mood={mood} size={MOOD_SIZE} active />
      </XStack>
    </XStack>
  );
}
