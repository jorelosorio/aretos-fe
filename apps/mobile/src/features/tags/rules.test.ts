import { TAGS_MAX, addTag, removeTag, sameTags } from './rules';

describe('addTag', () => {
  it('appends a trimmed name', () => {
    expect(addTag(['Work'], '  Health ')).toEqual(['Work', 'Health']);
  });

  it('ignores a name that is empty once trimmed', () => {
    expect(addTag(['Work'], '   ')).toEqual(['Work']);
  });

  it('ignores a name already present ignoring case, keeping the first spelling', () => {
    expect(addTag(['Work'], 'work')).toEqual(['Work']);
  });

  it('accepts exactly 50 characters and refuses 51', () => {
    const fifty = 'a'.repeat(50);
    expect(addTag([], fifty)).toEqual([fifty]);
    expect(addTag([], `${fifty}b`)).toEqual([]);
  });

  it('counts an emoji as one character, like the server', () => {
    const name = `${'a'.repeat(49)}🌱`;
    expect(addTag([], name)).toEqual([name]);
  });

  it('refuses a tag past the per-item maximum', () => {
    const full = Array.from({ length: TAGS_MAX }, (_, i) => `t${i}`);
    expect(addTag(full, 'one-more')).toEqual(full);
  });

  it('never mutates the list it was given', () => {
    const tags = ['Work'];
    addTag(tags, 'Health');
    expect(tags).toEqual(['Work']);
  });
});

describe('removeTag', () => {
  it('drops the named tag and keeps the order of the rest', () => {
    expect(removeTag(['a', 'b', 'c'], 'b')).toEqual(['a', 'c']);
  });
});

describe('sameTags', () => {
  it('ignores order and case', () => {
    expect(sameTags(['Work', 'health'], ['Health', 'work'])).toBe(true);
  });

  it('sees a tag added or removed', () => {
    expect(sameTags(['Work'], ['Work', 'Health'])).toBe(false);
    expect(sameTags([], [])).toBe(true);
  });
});
