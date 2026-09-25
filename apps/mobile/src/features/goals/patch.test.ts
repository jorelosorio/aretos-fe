import { toGoalPatch } from './patch';
import { EMPTY_DRAFT, type GoalDraft } from './types';

const initial: GoalDraft = { ...EMPTY_DRAFT, name: 'Health', tags: ['Body'] };

describe('toGoalPatch', () => {
  it('leaves tags out when they did not change', () => {
    const patch = toGoalPatch({ ...initial, name: 'Health+' }, initial);
    expect(patch).not.toHaveProperty('tags');
    expect(patch.name).toBe('Health+');
  });

  it('treats a change of case or order as no change', () => {
    const patch = toGoalPatch({ ...initial, tags: ['body'] }, initial);
    expect(patch).not.toHaveProperty('tags');
  });

  it('sends the whole list when a tag was added or removed', () => {
    expect(
      toGoalPatch({ ...initial, tags: ['Body', 'Mind'] }, initial).tags,
    ).toEqual(['Body', 'Mind']);
    expect(toGoalPatch({ ...initial, tags: [] }, initial).tags).toEqual([]);
  });
});
