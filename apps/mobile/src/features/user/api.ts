/**
 * MOCK. There is no profile endpoint yet.
 *
 * The home screen's header needs a name and a face, and `/v1/auth/token`
 * returns neither — only a `user_id`. Rather than leave the header out until
 * the backend catches up, it is fed from here, behind the same query surface
 * a real request would use: when `/v1/me` lands, `getProfile` starts issuing
 * it and nothing above this file changes.
 */

import type { Profile } from './types';

export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

const MOCK_PROFILE: Profile = {
  name: 'Jorge',
  avatarUrl: null,
};

export async function getProfile(): Promise<Profile> {
  return MOCK_PROFILE;
}
