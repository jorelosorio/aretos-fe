/**
 * The signed-in user's account, mirroring `GET /v1/me`
 * (`internal/api/v1/me_service.go`) field for field.
 *
 * Deliberately not the `Session` in `features/auth`: that holds credentials
 * and the `userId` the token was minted for, which is all the auth endpoints
 * return. Who the user *is* comes from here.
 */

import type { Tier } from '@/features/auth/types';

export type WireMe = {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  tier: string;
  has_password: boolean;
  providers: string[] | null;
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
  /**
   * Whether email and password sign-in works. False for an account Google
   * made until it sets one, so the app offers to "set" a password rather
   * than "change" it, and asks for no current password before a change.
   */
  hasPassword: boolean;
  /** Linked sign-in providers, such as `google`. Sorted, never null. */
  providers: string[];
  createdAt: string;
  updatedAt: string;
};

/**
 * What `PATCH /v1/me` amends. Email and tier are absent on purpose: the
 * address only changes once a code sent to the new one comes back (see
 * `requestEmailChange`), and nobody upgrades their own plan.
 *
 * There is no timezone field. Where a person is is a property of the request
 * rather than of the account — it
 * changes when they travel, and a stored copy is a second answer able to
 * disagree with the device in their hand — so it travels as the `X-Timezone`
 * header and is never written down.
 */
export type ProfilePatch = {
  displayName?: string;
};
