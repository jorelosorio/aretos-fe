import { planNoteWrite } from './routing';
import type { DiaryNote } from './types';

const standalone: DiaryNote = {
  id: 'n1',
  entryDate: '2026-09-20',
  body: 'old',
  tags: ['Work'],
  checkIn: null,
  createdAt: '2026-09-20T10:00:00Z',
  updatedAt: '2026-09-20T10:00:00Z',
};

const onCheckIn: DiaryNote = {
  ...standalone,
  id: 'n2',
  checkIn: {
    habitLogId: 'l1',
    goal: {
      id: 'g1',
      name: 'Health',
      colorSlot: 0,
      archived: false,
      trackingFrequency: 'daily',
      streakRule: 'logged',
      streakThreshold: 60,
    },
    mood: 3,
    answered: 1,
    skipped: 0,
    total: 1,
    completion: 1,
    status: 'complete',
    countsForStreak: true,
    endDate: '2026-09-20',
  },
};

const value = { entryDate: '2026-09-18', body: 'new', tags: ['Mind'] };

describe('planNoteWrite', () => {
  it('creates when there is no note', () => {
    expect(planNoteWrite(null, value)).toEqual({
      kind: 'create',
      draft: value,
    });
  });

  it('patches a standalone note, moving its day when it changed', () => {
    expect(planNoteWrite(standalone, value)).toEqual({
      kind: 'update',
      id: 'n1',
      patch: { body: 'new', tags: ['Mind'], entryDate: '2026-09-18' },
    });
  });

  it('leaves the day off a standalone patch when it did not change', () => {
    const plan = planNoteWrite(standalone, {
      ...value,
      entryDate: '2026-09-20',
    });
    expect(plan).toEqual({
      kind: 'update',
      id: 'n1',
      patch: { body: 'new', tags: ['Mind'] },
    });
  });

  it('routes a check-in note through its log and never sends a day', () => {
    expect(planNoteWrite(onCheckIn, value)).toEqual({
      kind: 'updateCheckIn',
      logId: 'l1',
      noteId: 'n2',
      patch: { body: 'new', tags: ['Mind'] },
    });
  });
});
