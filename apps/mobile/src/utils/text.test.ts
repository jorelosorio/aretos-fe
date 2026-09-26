import { capitalize } from './text';

describe('capitalize', () => {
  it('raises only the first letter', () => {
    expect(capitalize('jue, 24 sept.')).toBe('Jue, 24 sept.');
    expect(capitalize('work trips')).toBe('Work trips');
  });

  it('leaves a label that starts with a number, and an empty one, alone', () => {
    expect(capitalize('24 sept.')).toBe('24 sept.');
    expect(capitalize('')).toBe('');
  });
});
