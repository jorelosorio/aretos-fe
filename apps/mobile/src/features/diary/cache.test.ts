import { findListedNote } from './cache';
import type { DiaryNote, DiaryPage } from './types';

const note = (id: string): DiaryNote => ({
  id,
  entryDate: '2026-09-20',
  body: id,
  tags: [],
  checkIn: null,
  createdAt: '2026-09-20T10:00:00Z',
  updatedAt: '2026-09-20T10:00:00Z',
});

const page = (...ids: string[]): DiaryPage => ({
  notes: ids.map(note),
  total: ids.length,
  nextCursor: null,
  from: '2026-06-28',
  to: '2026-09-25',
  timezone: 'America/Bogota',
  historyCutoff: null,
  hasMoreHistory: false,
});

describe('findListedNote', () => {
  it('finds a note on any page of any cached list', () => {
    const lists = [
      undefined,
      { pages: [page('a')], pageParams: [null] },
      { pages: [page('b'), page('c')], pageParams: [null, 'x'] },
    ];

    expect(findListedNote(lists, 'c')?.body).toBe('c');
  });

  it('is undefined when no cached list holds it', () => {
    expect(
      findListedNote([{ pages: [page('a')], pageParams: [null] }], 'z'),
    ).toBeUndefined();
  });
});
