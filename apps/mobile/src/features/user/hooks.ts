import { useQuery } from '@tanstack/react-query';

import { getProfile, userKeys } from './api';

/**
 * The profile behind the home screen's greeting.
 *
 * `staleTime: Infinity` because a name does not change while the app is open,
 * and it keeps the mock from re-resolving on every screen focus. A real
 * endpoint would want the same: the profile is invalidated by the edit that
 * changes it, not by time.
 */
export function useProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: getProfile,
    staleTime: Infinity,
  });
}
