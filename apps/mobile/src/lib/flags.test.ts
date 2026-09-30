import { flagKey, parseFlag } from './flags';

describe('flagKey', () => {
  it('stores a device flag once for the phone', () => {
    expect(flagKey('device', 'seenNotice', null)).toBe(
      'aretos.flag.device.seenNotice',
    );
    expect(flagKey('device', 'seenNotice', 'user-1')).toBe(
      'aretos.flag.device.seenNotice',
    );
  });

  it('stores a user flag under the account', () => {
    expect(flagKey('user', 'guidePending', 'user-1')).toBe(
      'aretos.flag.user.user-1.guidePending',
    );
  });

  it('has nowhere to store a user flag without an account', () => {
    expect(flagKey('user', 'guidePending', null)).toBeNull();
  });
});

describe('parseFlag', () => {
  it('reads nothing stored as the starting value', () => {
    expect(parseFlag(null, true)).toBe(true);
  });

  it('reads back each kind of value', () => {
    expect(parseFlag('false', true)).toBe(false);
    expect(parseFlag('"dark"', 'light')).toBe('dark');
    expect(parseFlag('3', 0)).toBe(3);
    expect(parseFlag('{"step":2}', { step: 0 })).toEqual({ step: 2 });
    expect(parseFlag('["a"]', [] as string[])).toEqual(['a']);
  });

  it('treats a value of another kind as unset', () => {
    expect(parseFlag('"yes"', true)).toBe(true);
    expect(parseFlag('[1]', { step: 0 })).toEqual({ step: 0 });
    expect(parseFlag('null', 'light')).toBe('light');
  });

  it('treats unreadable storage as unset', () => {
    expect(parseFlag('{not json', true)).toBe(true);
  });
});
