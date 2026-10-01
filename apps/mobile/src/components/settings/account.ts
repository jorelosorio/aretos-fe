import { useCallback } from 'react';

import { useAuthErrorMessage } from '@/features/auth/hooks';
import { AuthErrorCode, type Tier } from '@/features/auth/types';
import { ApiError } from '@/lib/api/errors';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

const PLAN_LABELS: Record<string, TranslationKey> = {
  free: 'account.plan.free',
  plus: 'account.plan.plus',
};

/**
 * The copy for a plan, or null for one this release has no name for. A plan
 * added on the server reaches older apps before they learn its name, so the
 * caller shows its id instead of hiding which plan the account is on.
 */
export function planLabelKey(tier: Tier): TranslationKey | null {
  return PLAN_LABELS[tier] ?? null;
}

/**
 * The auth feature's messages, with one said differently. Signed in, the
 * email is not in question, so a refused password is "that password is not
 * right" rather than the sign-in screen's "wrong email or password".
 */
export function useAccountErrorMessage() {
  const { t } = useTranslations();
  const toMessage = useAuthErrorMessage();

  return useCallback(
    (error: unknown): string | null => {
      if (
        error instanceof ApiError &&
        error.code === AuthErrorCode.InvalidCredentials
      ) {
        return t('account.errors.wrongPassword');
      }
      return toMessage(error);
    },
    [t, toMessage],
  );
}
