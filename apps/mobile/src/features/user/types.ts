/**
 * The signed-in user's account, mirroring `GET /v1/me`
 * (`internal/api/v1/me_service.go`) field for field.
 *
 * Deliberately not the `Session` in `features/auth`: that holds credentials
 * and the `userId` the token was minted for, which is all the auth endpoints
 * return. Who the user *is* comes from here.
 */

import type { Tier } from '@/features/auth';

export type WireMe = {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  tier: string;
  /** IANA name. `UTC` until the user or a client sets one. */
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  email: string;
  /** May be empty: the provider does not always vouch for a name. */
  displayName: string;
  /** Empty when the provider sent no picture — never `null` on the wire. */
  avatarUrl: string;
  tier: Tier;
  timezone: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * What `PATCH /v1/me` amends. Email and tier are absent on purpose: the first
 * is the identity the provider vouched for, and nobody upgrades their own
 * plan.
 */
export type ProfilePatch = {
  displayName?: string;
  timezone?: string;
};
