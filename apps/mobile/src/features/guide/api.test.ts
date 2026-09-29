import { createGoal, getGoal } from '@/features/goals/api';
import { EMPTY_DRAFT as EMPTY_GOAL } from '@/features/goals/types';
import { createHabit } from '@/features/habits/api';
import { EMPTY_DRAFT as EMPTY_HABIT } from '@/features/habits/types';
import { saveLog } from '@/features/logs/api';

import { completeGuide } from './api';
import { freshProgress, type GuideDraft } from './types';

jest.mock('@/features/goals/api', () => ({
  createGoal: jest.fn(),
  getGoal: jest.fn(),
}));
jest.mock('@/features/habits/api', () => ({ createHabit: jest.fn() }));
jest.mock('@/features/logs/api', () => ({ saveLog: jest.fn() }));

const mockCreateGoal = createGoal as jest.Mock;
const mockGetGoal = getGoal as jest.Mock;
const mockCreateHabit = createHabit as jest.Mock;
const mockSaveLog = saveLog as jest.Mock;

const DRAFT: GuideDraft = {
  goalName: '  Trabaja con excelencia ',
  slots: ['Llega a tiempo', '', ' Cumple lo que prometes '],
  doneToday: ['Llega a tiempo'],
  seededFor: 'Trabaja con excelencia',
  colorSlot: 2,
};

beforeEach(() => {
  jest.resetAllMocks();
  mockCreateGoal.mockResolvedValue({ id: 'g1' });
  mockCreateHabit.mockImplementation(
    async (_goalId: string, draft: { name: string }) => ({
      id: `h-${draft.name}`,
    }),
  );
  mockGetGoal.mockResolvedValue({
    id: 'g1',
    progress: { currentPeriod: { entryDate: '2026-09-28' } },
  });
  mockSaveLog.mockResolvedValue({});
});

describe('completeGuide', () => {
  it('creates the goal, its habits and today’s check-in', async () => {
    const goalId = await completeGuide(DRAFT, freshProgress());

    expect(goalId).toBe('g1');
    expect(mockCreateGoal).toHaveBeenCalledWith({
      ...EMPTY_GOAL,
      name: 'Trabaja con excelencia',
      colorSlot: 2,
    });
    expect(mockCreateHabit.mock.calls).toEqual([
      ['g1', { ...EMPTY_HABIT, name: 'Llega a tiempo' }],
      ['g1', { ...EMPTY_HABIT, name: 'Cumple lo que prometes' }],
    ]);
    expect(mockGetGoal).toHaveBeenCalledWith('g1', { include: ['progress'] });
    expect(mockSaveLog).toHaveBeenCalledWith({
      goalId: 'g1',
      entryDate: '2026-09-28',
      mood: null,
      entries: [
        {
          habitId: 'h-Llega a tiempo',
          skipped: false,
          done: true,
          amount: null,
        },
        {
          habitId: 'h-Cumple lo que prometes',
          skipped: false,
          done: null,
          amount: null,
        },
      ],
    });
  });

  it('saves no check-in when nothing was marked', async () => {
    await completeGuide({ ...DRAFT, doneToday: [] }, freshProgress());

    expect(mockGetGoal).not.toHaveBeenCalled();
    expect(mockSaveLog).not.toHaveBeenCalled();
  });

  it('carries on after a habit failed, without a second goal', async () => {
    mockCreateHabit
      .mockResolvedValueOnce({ id: 'h-Llega a tiempo' })
      .mockRejectedValueOnce(new Error('offline'));
    const progress = freshProgress();

    await expect(completeGuide(DRAFT, progress)).rejects.toThrow('offline');
    expect(progress).toEqual({
      goalId: 'g1',
      habitIds: { 'Llega a tiempo': 'h-Llega a tiempo' },
      logged: false,
    });

    await completeGuide(DRAFT, progress);

    expect(mockCreateGoal).toHaveBeenCalledTimes(1);
    expect(mockCreateHabit).toHaveBeenCalledTimes(3);
    expect(mockCreateHabit).toHaveBeenLastCalledWith('g1', {
      ...EMPTY_HABIT,
      name: 'Cumple lo que prometes',
    });
    expect(mockSaveLog).toHaveBeenCalledTimes(1);
  });

  it('carries on after the check-in failed, without new habits', async () => {
    mockSaveLog.mockRejectedValueOnce(new Error('offline'));
    const progress = freshProgress();

    await expect(completeGuide(DRAFT, progress)).rejects.toThrow('offline');
    await completeGuide(DRAFT, progress);

    expect(mockCreateGoal).toHaveBeenCalledTimes(1);
    expect(mockCreateHabit).toHaveBeenCalledTimes(2);
    expect(mockSaveLog).toHaveBeenCalledTimes(2);
    expect(progress.logged).toBe(true);
  });

  it('writes nothing again once everything is saved', async () => {
    const progress = freshProgress();
    await completeGuide(DRAFT, progress);
    jest.clearAllMocks();

    await expect(completeGuide(DRAFT, progress)).resolves.toBe('g1');

    expect(mockCreateGoal).not.toHaveBeenCalled();
    expect(mockCreateHabit).not.toHaveBeenCalled();
    expect(mockSaveLog).not.toHaveBeenCalled();
  });

  it('fails without saving when the goal comes back without its period', async () => {
    mockGetGoal.mockResolvedValueOnce({ id: 'g1' });

    await expect(completeGuide(DRAFT, freshProgress())).rejects.toThrow();
    expect(mockSaveLog).not.toHaveBeenCalled();
  });
});
