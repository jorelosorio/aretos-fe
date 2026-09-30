import { AuthErrorCode } from '@/features/auth/types';

export type ResetStep = 'code' | 'password';

/**
 * Which step of the password reset a failure belongs to.
 *
 * The code and the new password reach the server together, on the last step,
 * so a code that turns out wrong is only discovered after the person has
 * moved past it. It sends them back to the code, where the fix is; anything
 * else — a password the policy refuses, a dropped connection — is answered on
 * the step they are on.
 */
export function resetStepFor(errorCode: string): ResetStep {
  return errorCode === AuthErrorCode.InvalidEmailCode ? 'code' : 'password';
}
