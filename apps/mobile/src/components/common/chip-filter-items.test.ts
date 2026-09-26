import { visibleItems } from './chip-filter-items';

const keys = Array.from({ length: 14 }, (_, i) => `k${i + 1}`);

describe('visibleItems', () => {
  it('shows the first ten and counts the rest when collapsed', () => {
    const { shown, hidden } = visibleItems(keys, null, false, 10);

    expect(shown).toEqual(keys.slice(0, 10));
    expect(hidden).toBe(4);
  });

  it('shows everything when expanded', () => {
    expect(visibleItems(keys, null, true, 10)).toEqual({
      shown: keys,
      hidden: 0,
    });
  });

  it('keeps the active item past the first ten in view when collapsed', () => {
    const { shown, hidden } = visibleItems(keys, 'k13', false, 10);

    expect(shown).toEqual([...keys.slice(0, 10), 'k13']);
    expect(hidden).toBe(3);
  });

  it('has nothing hidden when there are ten or fewer', () => {
    expect(visibleItems(keys.slice(0, 6), null, false, 10)).toEqual({
      shown: keys.slice(0, 6),
      hidden: 0,
    });
  });
});
