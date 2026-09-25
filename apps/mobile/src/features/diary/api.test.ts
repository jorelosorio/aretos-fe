import { api } from '@/lib/api';

import {
  addCheckInNote,
  createNote,
  deleteCheckInNote,
  getNote,
  listNotes,
  updateNote,
} from './api';

jest.mock('@/lib/api', () => ({
  api: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));
jest.mock('@/lib/timezone', () => ({ deviceTimezone: () => 'America/Bogota' }));

const mocked = api as unknown as Record<
  'get' | 'post' | 'patch' | 'delete',
  jest.Mock
>;

const wireStandalone = {
  id: 'n1',
  diary: { id: 'd1', name: null, color_slot: 0, default: true },
  entry_date: '2026-09-20',
  body: 'Standalone',
  tags: ['Work'],
  check_in: null,
  created_at: '2026-09-20T10:00:00Z',
  updated_at: '2026-09-20T10:00:00Z',
};

const wireOnCheckIn = {
  ...wireStandalone,
  id: 'n2',
  body: 'On a check-in',
  tags: [],
  check_in: {
    habit_log_id: 'l1',
    goal: {
      id: 'g1',
      name: 'Health',
      color_slot: 3,
      archived: false,
      tracking_frequency: 'weekly',
      streak_rule: 'threshold',
      streak_threshold: 60,
    },
    mood: 9,
    answered: 2,
    skipped: 0,
    total: 3,
    completion: 0.66,
    status: 'partial',
    counts_for_streak: true,
    end_date: '2026-09-26',
  },
};

const page = {
  notes: [wireStandalone, wireOnCheckIn],
  total: 2,
  next_cursor: '',
  from: '2026-06-28',
  to: '2026-09-25',
  timezone: 'America/Bogota',
  history_cutoff: '',
  has_more_history: false,
};

beforeEach(() => jest.clearAllMocks());

describe('diary api', () => {
  it('lists notes, sending the tag filter and mapping both kinds', async () => {
    mocked.get.mockResolvedValueOnce({ data: page });

    const result = await listNotes({ tag: 'Work' });

    expect(mocked.get).toHaveBeenCalledWith('/v1/diary-notes', {
      params: { limit: 20, tag: 'Work' },
    });
    expect(result.nextCursor).toBeNull();
    expect(result.historyCutoff).toBeNull();
    expect(result.notes[0]).toEqual({
      id: 'n1',
      entryDate: '2026-09-20',
      body: 'Standalone',
      tags: ['Work'],
      checkIn: null,
      createdAt: '2026-09-20T10:00:00Z',
      updatedAt: '2026-09-20T10:00:00Z',
    });
    expect(result.notes[1].checkIn).toMatchObject({
      habitLogId: 'l1',
      goal: { id: 'g1', colorSlot: 3, trackingFrequency: 'weekly' },
      mood: null,
      countsForStreak: true,
      endDate: '2026-09-26',
    });
  });

  it('reads one note by id and maps its check-in', async () => {
    mocked.get.mockResolvedValueOnce({ data: wireOnCheckIn });

    const note = await getNote('n2');

    expect(mocked.get).toHaveBeenCalledWith('/v1/diary-notes/n2');
    expect(note.id).toBe('n2');
    expect(note.checkIn).toMatchObject({
      habitLogId: 'l1',
      endDate: '2026-09-26',
    });
  });

  it('creates a note with its day, trimmed body and tags', async () => {
    mocked.post.mockResolvedValueOnce({ data: wireStandalone });

    await createNote({
      entryDate: '2026-09-20',
      body: '  hi  ',
      tags: ['Work'],
    });

    expect(mocked.post).toHaveBeenCalledWith('/v1/diary-notes', {
      entry_date: '2026-09-20',
      body: 'hi',
      tags: ['Work'],
    });
  });

  it('patches only the keys it is given', async () => {
    mocked.patch.mockResolvedValueOnce({ data: wireStandalone });

    await updateNote('n1', { tags: [] });

    expect(mocked.patch).toHaveBeenCalledWith('/v1/diary-notes/n1', {
      tags: [],
    });
  });

  it('adds and deletes check-in notes under their log', async () => {
    mocked.post.mockResolvedValueOnce({
      data: { id: 'n3', body: 'x', tags: [], created_at: 'a', updated_at: 'b' },
    });

    const note = await addCheckInNote('l1', { body: 'x', tags: [] });
    await deleteCheckInNote('l1', 'n3');

    expect(mocked.post).toHaveBeenCalledWith('/v1/habit-logs/l1/notes', {
      body: 'x',
      tags: [],
    });
    expect(note).toEqual({
      id: 'n3',
      body: 'x',
      tags: [],
      createdAt: 'a',
      updatedAt: 'b',
    });
    expect(mocked.delete).toHaveBeenCalledWith('/v1/habit-logs/l1/notes/n3');
  });
});
