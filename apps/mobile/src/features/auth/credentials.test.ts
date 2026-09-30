import {
  CODE_LENGTH,
  codeError,
  credentialError,
  PASSWORD_MIN,
  toCode,
} from './credentials';

describe('credentialError', () => {
  it('requires every field', () => {
    expect(credentialError('name', '')).toBe('required');
    expect(credentialError('name', '   ')).toBe('required');
    expect(credentialError('email', '')).toBe('required');
    expect(credentialError('currentPassword', '')).toBe('required');
    expect(credentialError('newPassword', '')).toBe('required');
  });

  it('accepts an email with surrounding spaces and capitals', () => {
    expect(credentialError('email', ' Ana@Mail.com ')).toBeNull();
  });

  it('rejects malformed emails', () => {
    expect(credentialError('email', 'ana')).toBe('emailInvalid');
    expect(credentialError('email', 'ana@mail')).toBe('emailInvalid');
    expect(credentialError('email', 'ana @mail.com')).toBe('emailInvalid');
  });

  it('enforces the minimum only on a new password', () => {
    const short = 'x'.repeat(PASSWORD_MIN - 1);
    expect(credentialError('newPassword', short)).toBe('passwordShort');
    expect(credentialError('newPassword', 'x'.repeat(PASSWORD_MIN))).toBeNull();
    expect(credentialError('currentPassword', short)).toBeNull();
  });

  it('counts spaces as characters in a password', () => {
    expect(credentialError('newPassword', ' '.repeat(PASSWORD_MIN))).toBeNull();
  });
});

describe('toCode', () => {
  it('keeps only digits from a pasted code', () => {
    expect(toCode('123 456')).toBe('123456');
    expect(toCode('123-456')).toBe('123456');
    expect(toCode(' 12a34b56 ')).toBe('123456');
  });

  it('stops at the code length', () => {
    expect(toCode('12345678')).toBe('123456');
  });
});

describe('codeError', () => {
  it('requires a code', () => {
    expect(codeError('')).toBe('required');
  });

  it('wants every digit', () => {
    expect(codeError('1'.repeat(CODE_LENGTH - 1))).toBe('codeLength');
    expect(codeError('1'.repeat(CODE_LENGTH))).toBeNull();
  });
});
