import { api } from '@/lib/api/client';
import { toSession } from '@/features/auth/session';
import type {
  CodeSentResponse,
  Session,
  TokenResponse,
} from '@/features/auth/types';

import type { Profile, ProfilePatch, WireMe } from './types';

/** Requests for the user feature, mirroring `aretos-be/bruno/Me/`. */
const paths = {
  me: '/v1/me',
  password: '/v1/me/password',
  email: '/v1/me/email',
  emailVerify: '/v1/me/email/verify',
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
  hasPassword: wire.has_password,
  providers: wire.providers ?? [],
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
  const { data } = await api.patch<WireMe>(paths.me, body);
  return toProfile(data);
}

/*
 * Changing how the account signs in. Each asks for the current password when
 * the account has one; a wrong one is 403 `AUTH_INVALID_CREDENTIALS`, never
 * 401, so the client does not take a typo for an expired session. An account
 * without a password sends none — the server has nothing to check it against.
 */

export type PasswordChange = {
  currentPassword: string | null;
  newPassword: string;
};

/**
 * Sets the password, or the first one. The server signs the account out
 * everywhere and answers with a new session for this device, which the
 * caller must install: the one it holds was just revoked.
 */
export async function changePassword({
  currentPassword,
  newPassword,
}: PasswordChange): Promise<Session> {
  const { data } = await api.put<TokenResponse>(paths.password, {
    current_password: currentPassword ?? undefined,
    new_password: newPassword,
  });
  return toSession(data);
}

export type EmailChange = { email: string; password: string | null };

/**
 * Emails a code to the new address. Nothing changes until it comes back.
 * Answers the same 202 when the address belongs to someone else, so it
 * cannot be used to find out; `RATE_LIMIT_EXCEEDED` means a code sent to a
 * different address is still live.
 */
export async function requestEmailChange({
  email,
  password,
}: EmailChange): Promise<CodeSentResponse> {
  const { data } = await api.post<CodeSentResponse>(paths.email, {
    email: email.trim(),
    password: password ?? undefined,
  });
  return data;
}

/** Spends the code and moves the account to the new address. */
export async function confirmEmailChange(code: string): Promise<Profile> {
  const { data } = await api.post<WireMe>(paths.emailVerify, { code });
  return toProfile(data);
}

/** Deletes the account and everything in it. There is no undo. */
export async function deleteAccount(password: string | null): Promise<void> {
  await api.delete(paths.me, {
    data: password === null ? undefined : { password },
  });
}
