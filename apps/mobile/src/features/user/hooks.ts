import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { installSession } from '@/features/auth/hooks';
import { sessionStore } from '@/features/auth/session';
import type { CodeSentResponse, Session } from '@/features/auth/types';
import type { ApiError } from '@/lib/api/errors';

import {
  changePassword,
  confirmEmailChange,
  deleteAccount,
  getMe,
  requestEmailChange,
  updateMe,
  userKeys,
  type EmailChange,
  type PasswordChange,
} from './api';
import type { Profile, ProfilePatch } from './types';

/**
 * The signed-in user's account.
 *
 * Long `staleTime` because none of it changes without this app changing it —
 * the mutations below write the cache directly, so a refetch would only
 * confirm what it already knows.
 */
export function useProfile() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: getMe,
    staleTime: 15 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, ProfilePatch>({
    mutationFn: updateMe,
    onSuccess: (profile) => {
      queryClient.setQueryData<Profile>(userKeys.me(), profile);
    },
  });
}

/**
 * The session is swapped before anything else happens: the one the app held
 * was revoked by the change, and the next refresh would otherwise fail and
 * sign this device out along with the others.
 */
export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation<Session, ApiError, PasswordChange>({
    mutationFn: changePassword,
    onSuccess: async (session) => {
      await installSession(queryClient, session);
      queryClient.setQueryData<Profile>(userKeys.me(), (profile) =>
        profile ? { ...profile, hasPassword: true } : profile,
      );
    },
  });
}

export function useRequestEmailChange() {
  return useMutation<CodeSentResponse, ApiError, EmailChange>({
    mutationFn: requestEmailChange,
  });
}

export function useConfirmEmailChange() {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, string>({
    mutationFn: confirmEmailChange,
    onSuccess: (profile) => {
      queryClient.setQueryData<Profile>(userKeys.me(), profile);
    },
  });
}

/**
 * Clears the session without revoking it: the account and its refresh tokens
 * are already gone, so there is nothing left to tell the server. Clearing the
 * store is what drops the navigator back to the welcome screen.
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string | null>({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      await sessionStore.clear();
      queryClient.clear();
    },
  });
}
