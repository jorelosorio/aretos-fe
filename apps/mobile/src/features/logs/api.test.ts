import { api } from '@/lib/api';

import { getLog, saveLog, updateLog } from './api';

jest.mock('@/lib/api', () => ({
  api: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

const mocked = api as unknown as Record<
  'get' | 'post' | 'patch' | 'delete',
  jest.Mock
>;

const wireLog = {
  id: 'l1',
  goal_id: 'g1',
  entry_date: '2026-09-22',
  mood: 4,
  notes: [
    {
      id: 'n1',
      body: 'First',
      tags: ['Work'],
      created_at: 'c1',
      updated_at: 'u1',
    },
  ],
  entries: [],
  created_at: '2026-09-22T10:00:00Z',
  updated_at: '2026-09-22T10:00:00Z',
};

beforeEach(() => jest.clearAllMocks());

describe('logs api', () => {
  it('maps the notes a log carries', async () => {
    mocked.get.mockResolvedValueOnce({ data: wireLog });

    const log = await getLog('l1');

    expect(log.notes).toEqual([
      {
        id: 'n1',
        body: 'First',
        tags: ['Work'],
        createdAt: 'c1',
        updatedAt: 'u1',
      },
    ]);
    expect(log).not.toHaveProperty('note');
  });

  it('saves a period without a note key', async () => {
    mocked.post.mockResolvedValueOnce({ data: wireLog });

    await saveLog({
      goalId: 'g1',
      entryDate: '2026-09-22',
      mood: 4,
      entries: [],
    });

    expect(mocked.post.mock.calls[0][1]).toEqual({
      goal_id: 'g1',
      entry_date: '2026-09-22',
      mood: 4,
      entries: [],
    });
  });

  it('patches the mood only', async () => {
    mocked.patch.mockResolvedValueOnce({ data: wireLog });

    await updateLog('l1', { mood: 2 });

    expect(mocked.patch).toHaveBeenCalledWith('/v1/habit-logs/l1', {
      mood: 2,
    });
  });
});
