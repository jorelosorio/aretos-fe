import { api } from '@/lib/api';

import { createGoal, listGoals, updateGoal } from './api';
import { EMPTY_DRAFT } from './types';

jest.mock('@/lib/api', () => ({
  api: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));
jest.mock('@/lib/timezone', () => ({ deviceTimezone: () => 'America/Bogota' }));

const mocked = api as unknown as Record<
  'get' | 'post' | 'patch' | 'delete',
  jest.Mock
>;

const wireGoal = {
  id: 'g1',
  name: 'Health',
  description: '',
  tracking_frequency: 'daily',
  streak_rule: 'logged',
  streak_threshold: 60,
  color_slot: 2,
  archived: false,
  tags: ['Body'],
  created_at: '2026-09-01T10:00:00Z',
  updated_at: '2026-09-01T10:00:00Z',
  habit_count: 1,
  progress: {
    timezone: 'America/Bogota',
    today: '2026-09-25',
    from: '2026-09-22',
    to: '2026-09-28',
    current_streak: 1,
    longest_streak: 3,
    pending: false,
    at_risk: false,
    days_left: 1,
    last_entry_date: '2026-09-25',
    current_period: {
      entry_date: '2026-09-25',
      log_id: 'l1',
      logged: true,
      answered: 1,
      skipped: 0,
      total: 1,
      completion: 1,
      status: 'complete',
      counts_for_streak: true,
      end_date: '2026-09-25',
      note_count: 2,
      mood: 4,
      entries: [],
    },
    periods: [],
  },
};

beforeEach(() => jest.clearAllMocks());

describe('goals api', () => {
  it('maps tags and note_count', async () => {
    mocked.get.mockResolvedValueOnce({ data: { goals: [wireGoal] } });

    const [goal] = await listGoals({ include: ['progress'] });

    expect(goal.tags).toEqual(['Body']);
    expect(goal.progress?.currentPeriod.noteCount).toBe(2);
    expect(goal.progress?.currentPeriod).not.toHaveProperty('note');
  });

  it('sends tags on create', async () => {
    mocked.post.mockResolvedValueOnce({ data: wireGoal });

    await createGoal({ ...EMPTY_DRAFT, name: 'Health', tags: ['Body'] });

    expect(mocked.post).toHaveBeenCalledWith(
      '/v1/goals',
      expect.objectContaining({ name: 'Health', tags: ['Body'] }),
    );
  });

  it('leaves tags off a patch that does not carry them', async () => {
    mocked.patch.mockResolvedValueOnce({ data: wireGoal });

    await updateGoal('g1', { name: 'Health' });

    expect(mocked.patch.mock.calls[0][1]).not.toHaveProperty('tags');
  });
});
