import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTheme } from '@tamagui/core';
import { SizableText, XStack, YStack } from 'tamagui';

import { resolveColor } from '@/components/common/theme-color';
import { TEXT } from '@/constants/layout';
import type { HeatCell } from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

import { HEAT_EMPTY, heatToken } from './heat-level';
import {
  cellAt,
  placeCells,
  squaresPath,
  WEEK_ROWS,
  type HeatmapLayout,
  type PlacedCell,
} from './heatmap-layout';

const MIN_CELL = 10;
const MAX_CELL = 28;
const GAP = 2;
const COMPACT_MAX = 12;
const RADIUS = 2;
const SKELETON_DELAY = 150;
const PULSE = 700;
const PULSE_LOW = 0.4;

function Grid({
  layout,
  size,
  selected,
  onSelect,
}: {
  layout: HeatmapLayout;
  size: number;
  selected: string | null;
  onSelect?: (cell: HeatCell) => void;
}) {
  const theme = useTheme();
  const step = size + GAP;

  const paths = useMemo(() => {
    const groups = new Map<string, PlacedCell[]>();

    for (const placed of layout.cells) {
      const token = heatToken(placed.cell);
      if (token === null) continue;

      const group = groups.get(token);
      if (group === undefined) groups.set(token, [placed]);
      else group.push(placed);
    }

    return [...groups].map(([token, squares]) => ({
      token,
      d: squaresPath(squares, size, GAP, RADIUS),
    }));
  }, [layout, size]);

  const outline =
    selected === null
      ? undefined
      : layout.cells.find((placed) => placed.cell.date === selected);

  const svg = (
    <Svg
      width={layout.columns * step - GAP}
      height={WEEK_ROWS * step - GAP}
      pointerEvents="none"
    >
      {paths.map(({ token, d }) => (
        <Path key={token} d={d} fill={resolveColor(theme, token)} />
      ))}

      {outline !== undefined && (
        <Rect
          x={outline.column * step + 1}
          y={outline.row * step + 1}
          width={size - 2}
          height={size - 2}
          rx={RADIUS}
          fill="none"
          stroke={resolveColor(theme, '$cardForeground')}
          strokeWidth={2}
        />
      )}
    </Svg>
  );

  if (onSelect === undefined) return svg;

  return (
    <Pressable
      onPress={(event) => {
        const cell = cellAt(
          layout,
          event.nativeEvent.locationX,
          event.nativeEvent.locationY,
          step,
        );
        if (cell !== null) onSelect(cell);
      }}
    >
      {svg}
    </Pressable>
  );
}

function Skeleton({
  layout,
  size,
  label,
}: {
  layout: HeatmapLayout;
  size: number;
  label: string;
}) {
  const theme = useTheme();
  const [opacity] = useState(() => new Animated.Value(0));
  const step = size + GAP;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(SKELETON_DELAY),
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: PULSE,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: PULSE_LOW,
            duration: PULSE,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]);

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const d = useMemo(
    () => squaresPath(layout.cells, size, GAP, RADIUS),
    [layout, size],
  );

  return (
    <Animated.View
      style={{ opacity }}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    >
      <Svg width={layout.columns * step - GAP} height={WEEK_ROWS * step - GAP}>
        <Path d={d} fill={resolveColor(theme, HEAT_EMPTY)} />
      </Svg>

      <YStack
        position="absolute"
        t={0}
        b={0}
        l={0}
        r={0}
        items="center"
        justify="center"
      >
        <SizableText
          size={TEXT.caption}
          fontWeight="600"
          color="$mutedForeground"
        >
          {label}
        </SizableText>
      </YStack>
    </Animated.View>
  );
}

export function Heatmap({
  width,
  cells,
  compact = false,
  pending = false,
  selected = null,
  onSelect,
}: {
  width: number;
  cells: readonly HeatCell[];
  compact?: boolean;
  pending?: boolean;
  selected?: string | null;
  onSelect?: (cell: HeatCell) => void;
}) {
  const { t } = useTranslations();
  const layout = useMemo(() => placeCells(cells), [cells]);
  const drawn = useDeferredValue(layout, null);
  const scroll = useRef<ScrollView>(null);

  if (layout.columns === 0) return null;

  const size = Math.max(
    MIN_CELL,
    Math.min(
      compact ? COMPACT_MAX : MAX_CELL,
      Math.floor(width / layout.columns) - GAP,
    ),
  );

  const content =
    pending || drawn !== layout ? (
      <Skeleton
        layout={layout}
        size={size}
        label={t(
          pending ? 'analysis.heatmap.loading' : 'analysis.heatmap.building',
        )}
      />
    ) : (
      <Grid
        layout={layout}
        size={size}
        selected={selected}
        onSelect={onSelect}
      />
    );

  if (layout.columns * (size + GAP) <= width) {
    return <XStack justify="center">{content}</XStack>;
  }

  return (
    <ScrollView
      ref={scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
      onContentSizeChange={() =>
        scroll.current?.scrollToEnd({ animated: false })
      }
    >
      {content}
    </ScrollView>
  );
}
