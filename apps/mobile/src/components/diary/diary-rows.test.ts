import type { DiaryNote } from '@/features/diary/types';

import { toRows } from './diary-rows';

const note = (id: string, entryDate: string): DiaryNote => ({
  id,
  entryDate,
  body: id,
  tags: [],
  checkIn: null,
  listedAt: '2026-10-01T10:00:00.000000Z',
  createdAt: '2026-10-01T10:00:00.000000Z',
  updatedAt: '2026-10-01T10:00:00.000000Z',
  sync: { state: 'synced', errorCode: null },
});

describe('toRows', () => {
  it('puts one heading over a run of notes from the same month', () => {
    const rows = toRows([note('a', '2026-10-02'), note('b', '2026-10-01')]);

    expect(rows.map((row) => row.kind)).toEqual(['month', 'note', 'note']);
  });

  it('keeps every key unique when a month comes back later in the list', () => {
    const rows = toRows([
      note('n', '2026-09-30'),
      note('a', '2026-10-01'),
      note('b', '2026-09-29'),
    ]);
    const keys = rows.map((row) => row.key);

    expect(rows.filter((row) => row.kind === 'month')).toHaveLength(3);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
