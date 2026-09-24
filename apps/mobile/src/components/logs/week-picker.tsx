import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { useTheme } from '@tamagui/core';
import { ChevronLeft, ChevronRight } from '@tamagui/lucide-icons-2';
import { Button, Circle, SizableText, XStack, YStack } from 'tamagui';

import { resolveColor } from '@/components/common/theme-color';
import { BUTTON, ICON, SPACING, TEXT } from '@/constants/layout';
import type {
  GoalPeriod,
  PeriodStatus,
  TrackingFrequency,
} from '@/features/goals';
import {
  periodKey,
  shiftPeriod,
  weekDays,
  weekdayIndex,
  type DateKey,
} from '@/features/logs';
import { useTranslations, type AppLocale } from '@/lib/i18n';

import {
  dayNumber,
  weekMonthLabel,
  weekdayLabel,
} from '@/components/common/date-label';
import { SectionTitle } from '@/components/common/section-title';
import {
  PERIOD_STATUS_COLORS,
  PERIOD_STATUS_LABELS,
} from '@/components/goals/period-status';

const CELL = 38;
const DOT = 6;

function weekList(first: DateKey, last: DateKey): DateKey[] {
  const weeks: DateKey[] = [];

  for (let week = first; week <= last; week = shiftPeriod(week, 'weekly', 1)) {
    weeks.push(week);
  }

  return weeks.length === 0 ? [last] : weeks;
}

function DayCell({
  day,
  locale,
  status,
  statusLabel,
  isSelected,
  isToday,
  isFuture,
  onPress,
}: {
  day: DateKey;
  locale: AppLocale;
  status: PeriodStatus | null;
  statusLabel: string;
  isSelected: boolean;
  isToday: boolean;
  isFuture: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <YStack
      flex={1}
      items="center"
      gap="$1"
      opacity={isFuture ? 0.35 : 1}
      onPress={isFuture ? undefined : onPress}
      pressStyle={isFuture ? undefined : { opacity: 0.6 }}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled: isFuture }}
      accessibilityLabel={`${weekdayLabel(day, locale)} ${dayNumber(day)}. ${statusLabel}`}
    >
      <SizableText size={TEXT.micro} color="$mutedForeground">
        {weekdayLabel(day, locale)}
      </SizableText>

      <Circle
        size={CELL}
        bg={isSelected ? '$primary' : '$card'}
        borderWidth={isSelected ? 0 : isToday ? 2 : 1}
        borderColor={isToday ? '$primary' : '$border'}
      >
        <SizableText
          size={TEXT.subheading}
          fontWeight="700"
          color={isSelected ? '$primaryForeground' : '$cardForeground'}
        >
          {dayNumber(day)}
        </SizableText>
      </Circle>

      <Svg width={DOT} height={DOT}>
        {status !== null && (
          <SvgCircle
            cx={DOT / 2}
            cy={DOT / 2}
            r={DOT / 2}
            fill={resolveColor(theme, PERIOD_STATUS_COLORS[status])}
          />
        )}
      </Svg>
    </YStack>
  );
}

export function WeekPicker({
  frequency,
  periods,
  selected,
  today,
  createdOn,
  onSelect,
}: {
  frequency: TrackingFrequency;
  periods: readonly GoalPeriod[];
  selected: DateKey;
  today: DateKey;
  createdOn: DateKey;
  onSelect: (date: DateKey) => void;
}) {
  const { t, locale } = useTranslations();

  const byWeek = frequency === 'weekly';
  const thisWeek = periodKey(today, 'weekly');
  const selectedWeek = periodKey(selected, 'weekly');

  const weeks = useMemo(() => {
    const created = periodKey(createdOn, 'weekly');
    const first = created < selectedWeek ? created : selectedWeek;
    return weekList(first, thisWeek);
  }, [createdOn, selectedWeek, thisWeek]);

  const index = Math.max(0, weeks.indexOf(selectedWeek));

  const listRef = useRef<FlatList<DateKey>>(null);
  const settled = useRef(index);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (width === 0 || settled.current === index) return;
    settled.current = index;
    listRef.current?.scrollToIndex({ index, animated: true });
  }, [index, width]);

  const periodFor = (day: DateKey) =>
    periods.find((period) => period.entryDate <= day && day <= period.endDate);

  const pickWeek = (next: number) => {
    const start = weeks[next];
    if (start === undefined) return;
    if (byWeek) {
      onSelect(start);
      return;
    }

    const day = weekDays(start)[weekdayIndex(selected)];
    onSelect(day > today ? today : day);
  };

  const onSettle = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next === settled.current) return;
    settled.current = next;
    pickWeek(next);
  };

  return (
    <YStack gap={SPACING.group}>
      <XStack items="center" justify="space-between">
        <Button
          size={BUTTON.compact}
          circular
          chromeless
          disabled={index === 0}
          opacity={index === 0 ? 0.3 : 1}
          onPress={() => pickWeek(index - 1)}
          icon={<ChevronLeft size={ICON.row} color="$color" />}
          accessibilityLabel={t('logs.period.previousWeek')}
        />

        <SectionTitle>
          {weekMonthLabel(weeks[index] ?? selectedWeek, locale)}
        </SectionTitle>

        <Button
          size={BUTTON.compact}
          circular
          chromeless
          disabled={index === weeks.length - 1}
          opacity={index === weeks.length - 1 ? 0.3 : 1}
          onPress={() => pickWeek(index + 1)}
          icon={<ChevronRight size={ICON.row} color="$color" />}
          accessibilityLabel={t('logs.period.nextWeek')}
        />
      </XStack>

      <YStack onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 && (
          <FlatList
            ref={listRef}
            data={weeks}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(week) => week}
            initialScrollIndex={index}
            getItemLayout={(_, item) => ({
              length: width,
              offset: width * item,
              index: item,
            })}
            onMomentumScrollEnd={onSettle}
            renderItem={({ item }) => (
              <XStack width={width} gap="$1">
                {weekDays(item).map((day) => {
                  const period = periodFor(day);
                  const status = period?.status ?? null;

                  return (
                    <DayCell
                      key={day}
                      day={day}
                      locale={locale}
                      status={status}
                      statusLabel={t(PERIOD_STATUS_LABELS[status ?? 'empty'])}
                      isSelected={
                        byWeek ? item === selectedWeek : day === selected
                      }
                      isToday={day === today}
                      isFuture={!byWeek && day > today}
                      onPress={() => onSelect(byWeek ? item : day)}
                    />
                  );
                })}
              </XStack>
            )}
          />
        )}
      </YStack>
    </YStack>
  );
}
