import { useMemo } from 'react';
import { ScrollView, XStack, YStack } from 'tamagui';

import type { HeatCell } from '@/features/analysis';
import { weekdayIndex } from '@/features/logs';

import { heatToken } from './heat-level';

const MIN_CELL = 10;
const MAX_CELL = 28;
const GAP = 2;
const COMPACT_CELL = MIN_CELL;
const WEEK_ROWS = 7;

type Column = (HeatCell | null)[];

const emptyColumn = (): Column => Array.from({ length: WEEK_ROWS }, () => null);

function toColumns(cells: readonly HeatCell[]): Column[] {
  if (cells.length === 0) return [];

  const columns: Column[] = [];
  let current = emptyColumn();
  let started = false;

  for (const cell of cells) {
    const row = weekdayIndex(cell.date);

    if (started && row === 0) {
      columns.push(current);
      current = emptyColumn();
    }

    current[row] = cell;
    started = true;
  }

  columns.push(current);
  return columns;
}

export function Heatmap({
  width,
  cells,
  compact = false,
}: {
  width: number;
  cells: readonly HeatCell[];
  compact?: boolean;
}) {
  const columns = useMemo(() => toColumns(cells), [cells]);

  const size = compact
    ? COMPACT_CELL
    : Math.max(
        MIN_CELL,
        Math.min(
          MAX_CELL,
          Math.floor(width / Math.max(columns.length, 1)) - GAP,
        ),
      );

  const grid = (
    <XStack gap={GAP}>
      {columns.map((column, index) => (
        <YStack key={index} gap={GAP}>
          {column.map((cell, row) => {
            const token = cell === null ? null : heatToken(cell);

            return (
              <YStack
                key={row}
                width={size}
                height={size}
                rounded={2}
                bg={token ?? 'transparent'}
              />
            );
          })}
        </YStack>
      ))}
    </XStack>
  );

  if (columns.length * (size + GAP) <= width) return grid;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexDirection: 'row-reverse' }}
    >
      {grid}
    </ScrollView>
  );
}
