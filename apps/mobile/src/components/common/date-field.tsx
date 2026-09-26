import { useState } from 'react';
import { CalendarDays, ChevronDown } from '@tamagui/lucide-icons-2';
import { SizableText, XStack, YStack } from 'tamagui';

import { BottomSheet } from '@/components/common/bottom-sheet';
import { longDateLabel } from '@/components/common/date-label';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

import { MonthCalendar } from './month-calendar';

export function DateField({
  value,
  today,
  min,
  max,
  onChange,
}: {
  value: string;
  today: string;
  min?: string;
  max?: string;
  onChange: (day: string) => void;
}) {
  const { t, locale } = useTranslations();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);

  const label =
    value === today
      ? `${t('logs.period.today')} · ${longDateLabel(value, locale)}`
      : longDateLabel(value, locale);

  return (
    <>
      <XStack
        items="center"
        gap={SPACING.group}
        px="$3"
        py="$3"
        bg="$card"
        rounded="$xl"
        borderWidth={1}
        borderColor={open ? '$primary' : '$border'}
        onPress={() => {
          setSession((current) => current + 1);
          setOpen(true);
        }}
        pressStyle={{ bg: '$cardPress' }}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={t('calendar.choose')}
      >
        <CalendarDays size={ICON.row} color="$primary" />
        <SizableText flex={1} size={TEXT.body} color="$color">
          {label}
        </SizableText>
        <ChevronDown size={ICON.row} color="$mutedForeground" />
      </XStack>

      <BottomSheet
        open={open}
        title={t('calendar.choose')}
        detent="fit"
        allowExpand={false}
        onDismiss={() => setOpen(false)}
      >
        <YStack pb={SPACING.screen}>
          <MonthCalendar
            key={session}
            value={value}
            today={today}
            min={min}
            max={max}
            onPick={(day) => {
              onChange(day);
              setOpen(false);
            }}
          />
        </YStack>
      </BottomSheet>
    </>
  );
}
