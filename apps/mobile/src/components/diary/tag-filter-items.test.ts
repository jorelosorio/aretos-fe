import { visibleTags } from './tag-filter-items';

const names = Array.from({ length: 14 }, (_, i) => `tag${i + 1}`);

describe('visibleTags', () => {
  it('shows the first ten and counts the rest when collapsed', () => {
    const { shown, hidden } = visibleTags(names, null, false, 10);

    expect(shown).toEqual(names.slice(0, 10));
    expect(hidden).toBe(4);
  });

  it('shows everything when expanded', () => {
    expect(visibleTags(names, null, true, 10)).toEqual({
      shown: names,
      hidden: 0,
    });
  });

  it('keeps an active tag past the first ten in view when collapsed', () => {
    const { shown, hidden } = visibleTags(names, 'TAG13', false, 10);

    expect(shown).toEqual([...names.slice(0, 10), 'tag13']);
    expect(hidden).toBe(3);
  });

  it('has nothing hidden when there are ten or fewer', () => {
    expect(visibleTags(names.slice(0, 6), null, false, 10)).toEqual({
      shown: names.slice(0, 6),
      hidden: 0,
    });
  });
});
