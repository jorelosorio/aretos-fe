/**
 * The rules the email forms check before they may submit.
 *
 * A password of at least 8 characters on sign-up, and anything non-empty on
 * log in, since an existing account's password may be shorter than the
 * sign-up rule and the server is what judges it. Emails are trimmed first because autofill and keyboards add trailing
 * spaces; passwords are not, since a space is a real character in one.
 */

export type CredentialRule =
  'name' | 'email' | 'currentPassword' | 'newPassword';

export type CredentialError = 'required' | 'emailInvalid' | 'passwordShort';

export const PASSWORD_MIN = 8;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function credentialError(
  rule: CredentialRule,
  value: string,
): CredentialError | null {
  const secret = rule === 'currentPassword' || rule === 'newPassword';
  const text = secret ? value : value.trim();

  if (text.length === 0) return 'required';
  if (rule === 'email' && !EMAIL.test(text)) return 'emailInvalid';
  if (rule === 'newPassword' && text.length < PASSWORD_MIN) {
    return 'passwordShort';
  }
  return null;
}

/** The server's `emailCodeDigits`. */
export const CODE_LENGTH = 6;

export type CodeError = 'required' | 'codeLength';

/**
 * What a code field keeps of what was typed or pasted: digits only, so a code
 * copied from the email with a space or a dash in it still fits.
 */
export function toCode(input: string): string {
  return input.replace(/\D/g, '').slice(0, CODE_LENGTH);
}

export function codeError(code: string): CodeError | null {
  if (code.length === 0) return 'required';
  if (code.length !== CODE_LENGTH) return 'codeLength';
  return null;
}
