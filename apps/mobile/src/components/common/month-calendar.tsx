import { useState } from 'react';
import { ChevronLeft, ChevronRight } from '@tamagui/lucide-icons-2';
import { Circle, SizableText, XStack, YStack } from 'tamagui';

import {
  dayNumber,
  longDateLabel,
  monthLabel,
  weekdayInitial,
} from '@/components/common/date-label';
import { HeaderIconButton } from '@/components/common/header-actions';
import { SectionTitle } from '@/components/common/section-title';
import { SPACING, TEXT } from '@/constants/layout';
import { useTranslations, type AppLocale } from '@/lib/i18n';

import { monthGrid, monthOf, shiftMonth } from './month-grid';

const CELL = 38;
const MONDAY_FIRST_WEEK = Array.from(
  { length: 7 },
  (_, day) => `2026-09-${21 + day}`,
);

function DayCell({
  day,
  locale,
  selected,
  today,
  disabled,
  onPress,
}: {
  day: string;
  locale: AppLocale;
  selected: boolean;
  today: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <YStack
      flex={1}
      items="center"
      opacity={disabled ? 0.35 : 1}
      onPress={disabled ? undefined : onPress}
      pressStyle={disabled ? undefined : { opacity: 0.6 }}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={longDateLabel(day, locale)}
    >
      <Circle
        size={CELL}
        bg={selected ? '$primary' : 'transparent'}
        borderWidth={selected ? 0 : today ? 2 : 0}
        borderColor="$primary"
      >
        <SizableText
          size={TEXT.body}
          fontWeight={selected || today ? '700' : '400'}
          color={selected ? '$primaryForeground' : '$color'}
        >
          {dayNumber(day)}
        </SizableText>
      </Circle>
    </YStack>
  );
}

export function MonthCalendar({
  value,
  today,
  min,
  max,
  onPick,
}: {
  value: string;
  today: string;
  min?: string;
  max?: string;
  onPick: (day: string) => void;
}) {
  const { t, locale } = useTranslations();
  const [month, setMonth] = useState(monthOf(value));

  const canGoBack = min === undefined || month > monthOf(min);
  const canGoForward = max === undefined || month < monthOf(max);
  const outside = (day: string) =>
    (min !== undefined && day < min) || (max !== undefined && day > max);

  return (
    <YStack gap={SPACING.group}>
      <XStack items="center" justify="space-between">
        <HeaderIconButton
          Icon={ChevronLeft}
          label={t('calendar.previousMonth')}
          disabled={!canGoBack}
          onPress={() => setMonth(shiftMonth(month, -1))}
        />
        <SectionTitle>{monthLabel(month, locale)}</SectionTitle>
        <HeaderIconButton
          Icon={ChevronRight}
          label={t('calendar.nextMonth')}
          disabled={!canGoForward}
          onPress={() => setMonth(shiftMonth(month, 1))}
        />
      </XStack>

      <XStack>
        {MONDAY_FIRST_WEEK.map((day) => (
          <SizableText
            key={day}
            flex={1}
            text="center"
            size={TEXT.micro}
            color="$mutedForeground"
          >
            {weekdayInitial(day, locale)}
          </SizableText>
        ))}
      </XStack>

      <YStack gap="$1">
        {monthGrid(month).map((week, row) => (
          <XStack key={`${month}:${row}`}>
            {week.map((day, column) =>
              day === null ? (
                <YStack key={`${row}:${column}`} flex={1} height={CELL} />
              ) : (
                <DayCell
                  key={day}
                  day={day}
                  locale={locale}
                  selected={day === value}
                  today={day === today}
                  disabled={outside(day)}
                  onPress={() => onPick(day)}
                />
              ),
            )}
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}
