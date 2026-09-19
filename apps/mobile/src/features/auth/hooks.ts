import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useTranslations, type TranslationKey } from '@/lib/i18n';
import { ApiError } from '@/lib/api';

import { authKeys, revokeRefreshToken, signIn, type SignInResult } from './api';
import { ensureFreshSession } from './refresh';
import { isExpiring, msUntilRefresh, sessionStore } from './session';
import { AuthErrorCode, type AuthProvider, type Session } from './types';

/**
 * Reads the current session.
 *
 * `useQuery` owns the one-shot restore from the Keychain — it gives the splash
 * screen its loading flag and dedupes the read across however many components
 * mount at once. `useSyncExternalStore` then keeps the component subscribed to
 * the store itself, so a refresh or a sign-out from an interceptor re-renders
 * the tree without going through the cache.
 */
export function useSession() {
  const restore = useQuery({
    queryKey: authKeys.session(),
    queryFn: sessionStore.hydrate,
    // The store, not the cache, is the source of truth after this first read.
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });

  const session = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.get,
    sessionStore.get,
  );

  return {
    session,
    isAuthenticated: session !== null,
    /** True until the persisted session has been read back. */
    isRestoring: restore.isPending,
  };
}

/**
 * Starts the OAuth flow and, on success, installs the session.
 *
 * A mutation rather than a query: user-triggered, writes state, and must never
 * be retried — the one-time code it spends is good for exactly one use.
 */
export function useSignIn(provider: AuthProvider = 'google') {
  const queryClient = useQueryClient();

  const mutation = useMutation<SignInResult, ApiError>({
    mutationKey: authKeys.signIn(),
    mutationFn: () => signIn(provider),
    // Declared in the options rather than passed to `mutate`: callbacks handed
    // to `mutate` belong to the calling component and are dropped if it
    // unmounts, which on Android it does — see `useSignInStatus`.
    onSuccess: async (result) => {
      if (result.status !== 'signed-in') return;
      await sessionStore.set(result.session);
      queryClient.setQueryData<Session>(authKeys.session(), result.session);
    },
  });

  const status = useSignInStatus();

  return { signIn: mutation.mutate, ...status };
}

/**
 * The sign-in's progress, read from the mutation cache rather than from one
 * component's own observer.
 *
 * The indirection is there for Android, where the OAuth redirect comes back as
 * a deep link. That intent resets the navigation state, so the login screen is
 * unmounted while the one-time code is still being exchanged: a remounted
 * `useMutation` is idle, which would drop the button back to "Continue with
 * Google" mid-flight and leave a failed exchange with no error to show. The
 * cache outlives the unmount, so both survive it.
 */
export function useSignInStatus() {
  // Whatever the newest attempt is, whatever its status. Filtering on `error`
  // instead would keep surfacing the last failure through the retry after it.
  const states = useMutationState({
    filters: { mutationKey: authKeys.signIn() },
    select: (mutation) => ({
      status: mutation.state.status,
      error: mutation.state.error as ApiError | null,
    }),
  });
  const latest = states[states.length - 1];

  return {
    isSigningIn: latest?.status === 'pending',
    /** Null when the user simply dismissed the consent screen. */
    error: latest?.status === 'error' ? latest.error : null,
  };
}

/** Revokes the refresh token, drops it from the Keychain, empties the cache. */
export function useSignOut() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const session = sessionStore.get();

      // Best effort. Offline, the server keeps a live refresh token until it
      // expires — but holding the user on a screen they asked to leave is
      // worse, and /logout is idempotent.
      if (session) {
        await revokeRefreshToken(session.refreshToken).catch(() => undefined);
      }

      await sessionStore.clear();
    },
    // After the store is empty, so nothing refetches under the old token.
    onSettled: () => queryClient.clear(),
  });

  return { signOut: mutation.mutate, isSigningOut: mutation.isPending };
}

/** setTimeout is 32-bit on Hermes; anything longer silently fires at once. */
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/**
 * Keeps the access token alive for as long as the app is signed in. Mounted
 * once, at the root.
 *
 * Two triggers, because neither is enough alone:
 *
 * - **A timer** fires one skew ahead of expiry. It covers a session left open,
 *   but JS timers are suspended while the app is backgrounded.
 * - **Foregrounding** re-checks on every `active` transition. This is what
 *   handles a dismissed or long-backgrounded app: the timer that should have
 *   fired an hour ago did not, so the token is checked the instant the app is
 *   visible again — before any screen can issue a request.
 *
 * Both go through `ensureFreshSession`, so a timer firing as the app
 * foregrounds still produces exactly one refresh. A refresh that fails because
 * the token is dead clears the session, which drops the navigator's guard back
 * to the login screen on its own.
 */
export function useSessionAutoRefresh() {
  const { session } = useSession();
  // Moves on every rotation, which reschedules the timer.
  const expiresAt = session?.expiresAt ?? null;

  useEffect(() => {
    if (expiresAt === null) return;

    // Network failures keep the session; the next foreground retries.
    const refresh = () => void ensureFreshSession().catch(() => undefined);

    const timer = setTimeout(
      refresh,
      Math.min(msUntilRefresh(expiresAt), MAX_TIMEOUT_MS),
    );
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active' && isExpiring(expiresAt)) refresh();
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [expiresAt]);
}

/**
 * Maps the backend's error codes onto copy a user can act on. Codes are the
 * contract; the `error` string in the body is English-only and for logs.
 */
const MESSAGES: Record<string, TranslationKey> = {
  [AuthErrorCode.RedirectNotAllowed]: 'auth.errors.redirectNotAllowed',
  [AuthErrorCode.EmailNotVerified]: 'auth.errors.emailNotVerified',
  [AuthErrorCode.ProviderAuthFailed]: 'auth.errors.providerAuthFailed',
  [AuthErrorCode.TierNotAllowed]: 'auth.errors.tierNotAllowed',
  [AuthErrorCode.InvalidAuthCode]: 'auth.errors.expiredCode',
  [AuthErrorCode.InvalidOAuthState]: 'auth.errors.expiredCode',
  [AuthErrorCode.InvalidRefreshToken]: 'auth.errors.sessionExpired',
  [AuthErrorCode.RefreshReuseDetected]: 'auth.errors.sessionExpired',
};

export function useAuthErrorMessage() {
  const { t } = useTranslations();

  return useCallback(
    (error: unknown): string | null => {
      if (!error) return null;
      if (!(error instanceof ApiError)) return t('auth.errors.generic');
      if (error.isNetworkError) return t('auth.errors.network');
      return t(MESSAGES[error.code] ?? 'auth.errors.generic');
    },
    [t],
  );
}
