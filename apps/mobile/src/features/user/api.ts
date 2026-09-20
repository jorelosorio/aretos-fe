import { api } from '@/lib/api';

import type { Profile, ProfilePatch, WireMe } from './types';

/** Requests for the user feature, mirroring `aretos-be/bruno/Me/`. */
const paths = {
  me: '/v1/me',
};

export const userKeys = {
  all: ['user'] as const,
  me: () => [...userKeys.all, 'me'] as const,
};

const toProfile = (wire: WireMe): Profile => ({
  id: wire.id,
  email: wire.email,
  displayName: wire.display_name,
  avatarUrl: wire.avatar_url,
  tier: wire.tier,
  timezone: wire.timezone,
  createdAt: wire.created_at,
  updatedAt: wire.updated_at,
});

export async function getMe(): Promise<Profile> {
  const { data } = await api.get<WireMe>(paths.me);
  return toProfile(data);
}

/** An omitted key never reaches the body, which is what leaves a column alone. */
export async function updateMe(patch: ProfilePatch): Promise<Profile> {
  const body: Record<string, unknown> = {};

  if (patch.displayName !== undefined) {
    body.display_name = patch.displayName.trim();
  }
  if (patch.timezone !== undefined) body.timezone = patch.timezone;

  const { data } = await api.patch<WireMe>(paths.me, body);
  return toProfile(data);
}
