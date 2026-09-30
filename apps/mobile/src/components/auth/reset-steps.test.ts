import { NETWORK_ERROR } from '@/lib/api/errors';
import { AuthErrorCode } from '@/features/auth/types';

import { resetStepFor } from './reset-steps';

describe('resetStepFor', () => {
  it('sends a bad code back to the code step', () => {
    expect(resetStepFor(AuthErrorCode.InvalidEmailCode)).toBe('code');
  });

  it('keeps every other failure on the password step', () => {
    expect(resetStepFor(AuthErrorCode.WeakPassword)).toBe('password');
    expect(resetStepFor(NETWORK_ERROR)).toBe('password');
    expect(resetStepFor('INTERNAL_ERROR')).toBe('password');
  });
});
