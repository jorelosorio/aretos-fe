import { api } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

import {
  addCheckInNote,
  getWireNote,
  listNotes,
  sendNewNote,
  sendNoteDelete,
  sendNoteEdit,
} from './api';

jest.mock('@/lib/api/client', () => ({
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
  listed_at: '2026-09-20T10:00:00Z',
  created_at: '2026-09-20T10:00:00Z',
  updated_at: '2026-09-20T10:00:00Z',
  version: 1,
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
      streak_skip_limit: 2,
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
      listedAt: '2026-09-20T10:00:00.000000Z',
      createdAt: '2026-09-20T10:00:00.000000Z',
      updatedAt: '2026-09-20T10:00:00.000000Z',
      sync: { state: 'synced', errorCode: null },
    });
    expect(result.notes[1].checkIn).toMatchObject({
      habitLogId: 'l1',
      goal: { id: 'g1', colorSlot: 3, trackingFrequency: 'weekly' },
      mood: null,
      countsForStreak: true,
      endDate: '2026-09-26',
    });
  });

  it('reads one note as the server has it, and null once it is gone', async () => {
    mocked.get.mockResolvedValueOnce({ data: wireOnCheckIn });
    await expect(getWireNote('n2')).resolves.toEqual(wireOnCheckIn);
    expect(mocked.get).toHaveBeenCalledWith('/v1/diary-notes/n2');

    mocked.get.mockRejectedValueOnce(new ApiError('NOT_FOUND', 'gone', 404));
    await expect(getWireNote('n2')).resolves.toBeNull();

    mocked.get.mockRejectedValueOnce(new ApiError('INTERNAL', 'boom', 500));
    await expect(getWireNote('n2')).rejects.toBeInstanceOf(ApiError);
  });

  it('creates a note under the id the device made up', async () => {
    mocked.post.mockResolvedValueOnce({ data: wireStandalone });

    await sendNewNote('n1', {
      entry_date: '2026-09-20',
      body: 'hi',
      tags: ['Work'],
      written_at: '2026-09-20T10:00:00.000000Z',
    });

    expect(mocked.post).toHaveBeenCalledWith('/v1/diary-notes', {
      id: 'n1',
      entry_date: '2026-09-20',
      body: 'hi',
      tags: ['Work'],
      written_at: '2026-09-20T10:00:00.000000Z',
    });
  });

  it('names the version an edit or delete was made against', async () => {
    mocked.patch.mockResolvedValue({ data: wireStandalone });

    await sendNoteEdit('n1', { tags: [] }, 3);
    await sendNoteEdit('n1', { tags: [] }, null);
    await sendNoteDelete('n1', 4);

    expect(mocked.patch).toHaveBeenNthCalledWith(1, '/v1/diary-notes/n1', {
      tags: [],
      version: 3,
    });
    expect(mocked.patch).toHaveBeenNthCalledWith(2, '/v1/diary-notes/n1', {
      tags: [],
    });
    expect(mocked.delete).toHaveBeenCalledWith('/v1/diary-notes/n1', {
      params: { version: 4 },
    });
  });

  it('adds a check-in note under its log, with what an offline write carries', async () => {
    mocked.post.mockResolvedValueOnce({
      data: { id: 'n3', body: 'x', tags: [], created_at: 'a', updated_at: 'b' },
    });

    const note = await addCheckInNote(
      'l1',
      { body: '  x  ', tags: [] },
      { id: 'n3', written_at: 'w' },
    );

    expect(mocked.post).toHaveBeenCalledWith('/v1/habit-logs/l1/notes', {
      body: 'x',
      tags: [],
      id: 'n3',
      written_at: 'w',
    });
    expect(note).toEqual({
      id: 'n3',
      body: 'x',
      tags: [],
      createdAt: 'a',
      updatedAt: 'b',
    });
  });
});
