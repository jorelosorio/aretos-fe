import { foldChange, planResult, type Change } from './queue';

const create: Change = {
  op: 'create',
  fields: { entry_date: '2026-10-01', body: 'first', tags: [] },
};

describe('foldChange', () => {
  it('takes the first change as it is', () => {
    expect(foldChange(null, create)).toEqual(create);
  });

  it('folds edits into a create nobody has seen', () => {
    expect(
      foldChange(create, { op: 'update', fields: { body: 'second' } }),
    ).toEqual({
      op: 'create',
      fields: { entry_date: '2026-10-01', body: 'second', tags: [] },
    });
  });

  it('sends nothing for a note created and deleted offline', () => {
    expect(foldChange(create, { op: 'delete', fields: {} })).toBeNull();
  });

  it('merges edits, the later field winning', () => {
    expect(
      foldChange(
        { op: 'update', fields: { body: 'a', tags: ['x'] } },
        { op: 'update', fields: { body: 'b' } },
      ),
    ).toEqual({ op: 'update', fields: { body: 'b', tags: ['x'] } });
  });

  it('lets a delete replace an edit', () => {
    expect(
      foldChange(
        { op: 'update', fields: { body: 'a' } },
        { op: 'delete', fields: {} },
      ),
    ).toEqual({ op: 'delete', fields: {} });
  });
});

describe('planResult', () => {
  it.each([
    ['create', 'applied', 'adopt'],
    ['update', 'applied', 'adopt'],
    ['delete', 'applied', 'forget'],
    ['update', 'conflict', 'fork'],
    ['delete', 'conflict', 'restore'],
    ['update', 'gone', 'forkAndForget'],
    ['create', 'gone', 'forkAndForget'],
    ['delete', 'gone', 'forget'],
    ['create', 'rejected', 'reject'],
    ['delete', 'rejected', 'restore'],
  ] as const)('%s %s → %s', (op, status, plan) => {
    expect(planResult(op, status)).toBe(plan);
  });
});
