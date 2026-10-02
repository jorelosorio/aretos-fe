import { api } from '@/lib/api/client';

import {
  createTemplate,
  listTemplates,
  startFromTemplate,
  templateFromGoal,
  templateKeys,
  updateTemplate,
} from './api';
import { toTemplatePatch } from './patch';
import type { TemplateDraft } from './types';

jest.mock('@/lib/api/client', () => ({
  api: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

const mocked = api as unknown as Record<
  'get' | 'post' | 'patch' | 'delete',
  jest.Mock
>;

const wireTemplate = {
  id: 't1',
  name: 'Cuida tu cuerpo',
  description: '',
  language: 'es',
  tracking_frequency: 'daily',
  streak_rule: 'logged',
  streak_threshold: 60,
  streak_skip_limit: 2,
  active: false,
  habits: [
    {
      position: 1,
      name: 'Caminar',
      tracking_mode: 'duration',
      weight: 1,
      success_threshold: 30,
      if_then_plan: '',
    },
    {
      position: 0,
      name: 'Agua',
      tracking_mode: 'binary',
      weight: 2,
      success_threshold: null,
      if_then_plan: '',
    },
  ],
  publisher: { name: 'Aretos', official: true },
  owned: true,
  review: {
    status: 'pending',
    note: '',
    reviewed_at: null,
    shared: false,
  },
  uses: 4,
  created_at: '2026-09-01T10:00:00Z',
  updated_at: '2026-09-01T10:00:00Z',
};

const draft: TemplateDraft = {
  name: ' Cuida tu cuerpo ',
  description: '',
  language: 'es',
  trackingFrequency: 'daily',
  streakRule: 'logged',
  streakThreshold: 60,
  streakSkipLimit: 2,
  habits: [
    {
      name: 'Agua',
      trackingMode: 'binary',
      weight: 1,
      successThreshold: 3,
      ifThenPlan: '',
    },
  ],
};

beforeEach(() => jest.clearAllMocks());

describe('listTemplates', () => {
  it('sends only the filters set, and maps habits in position order', async () => {
    mocked.get.mockResolvedValue({
      data: { templates: [wireTemplate], next_offset: 20 },
    });

    const page = await listTemplates(
      { q: '  run ', scope: 'official', language: 'en' },
      0,
    );

    expect(mocked.get).toHaveBeenCalledWith('/v1/templates', {
      params: { q: 'run', scope: 'official', language: 'en', limit: 20 },
    });
    expect(page.nextOffset).toBe(20);
    expect(page.templates[0].habits.map((habit) => habit.name)).toEqual([
      'Agua',
      'Caminar',
    ]);
    expect(page.templates[0].review).toEqual({
      status: 'pending',
      note: '',
      reviewedAt: null,
      shared: false,
    });
  });

  it('asks for the next page by offset', async () => {
    mocked.get.mockResolvedValue({
      data: { templates: [], next_offset: null },
    });

    await listTemplates({ scope: 'mine' }, 40);

    expect(mocked.get).toHaveBeenCalledWith('/v1/templates', {
      params: { scope: 'mine', limit: 20, offset: 40 },
    });
  });

  it('keys a search the way it is sent', () => {
    expect(templateKeys.list({ q: 'run ' })).toEqual(
      templateKeys.list({ q: 'run' }),
    );
  });
});

describe('writes', () => {
  it('creates with snake_case, dropping a binary habit threshold', async () => {
    mocked.post.mockResolvedValue({ data: wireTemplate });

    await createTemplate(draft);

    expect(mocked.post).toHaveBeenCalledWith('/v1/templates', {
      name: 'Cuida tu cuerpo',
      description: '',
      language: 'es',
      tracking_frequency: 'daily',
      streak_rule: 'logged',
      streak_threshold: 60,
      streak_skip_limit: 2,
      habits: [
        { name: 'Agua', tracking_mode: 'binary', weight: 1, if_then_plan: '' },
      ],
    });
  });

  it('switches sharing without touching anything else', async () => {
    mocked.patch.mockResolvedValue({ data: wireTemplate });

    await updateTemplate('t1', { active: true });

    expect(mocked.patch).toHaveBeenCalledWith('/v1/templates/t1', {
      active: true,
    });
  });

  it('starts a goal and answers its id', async () => {
    mocked.post.mockResolvedValue({ data: { id: 'g9', name: 'x' } });

    await expect(startFromTemplate('t1')).resolves.toBe('g9');
    expect(mocked.post).toHaveBeenCalledWith('/v1/templates/t1/use');
  });

  it('exports a goal, leaving a blank name to the server', async () => {
    mocked.post.mockResolvedValue({ data: wireTemplate });

    await templateFromGoal('g1', { language: 'en', name: '  ' });

    expect(mocked.post).toHaveBeenCalledWith('/v1/goals/g1/template', {
      language: 'en',
    });
  });
});

describe('toTemplatePatch', () => {
  it('sends nothing for an unchanged draft', () => {
    expect(
      toTemplatePatch({ ...draft, name: 'Cuida tu cuerpo' }, draft),
    ).toEqual({});
  });

  it('sends only what changed, habits whole', () => {
    const habits = [...draft.habits].reverse().concat({
      ...draft.habits[0],
      name: 'Dormir',
    });

    expect(
      toTemplatePatch({ ...draft, language: 'en', habits }, draft),
    ).toEqual({ language: 'en', habits });
  });
});
