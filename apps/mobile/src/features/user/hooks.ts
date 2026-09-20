import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getMe, updateMe, userKeys } from './api';
import type { Profile, ProfilePatch } from './types';

/**
 * The signed-in user's account.
 *
 * Long `staleTime` because none of it changes without this app changing it —
 * the mutation below writes the cache directly, so a refetch would only
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

  return useMutation({
    mutationFn: (patch: ProfilePatch) => updateMe(patch),
    onSuccess: (profile) => {
      queryClient.setQueryData<Profile>(userKeys.me(), profile);
    },
  });
}
