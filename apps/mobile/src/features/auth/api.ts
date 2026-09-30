import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { env } from '@/lib/env';
import { ApiError } from '@/lib/api/errors';
import { publicApi } from '@/lib/api/client';

import { toSession } from './session';
import {
  AuthErrorCode,
  type AuthProvider,
  type CodeSentResponse,
  type Session,
  type TokenResponse,
} from './types';

/**
 * Requests for the auth feature, mirroring `aretos-be/bruno/Auth/`. There is
 * no call for `/v1/auth/:provider/callback` on purpose — the OAuth provider
 * calls that, never a client.
 *
 * All of them go through `publicApi`: none takes an Authorization header, and
 * routing a refresh through the authenticated client would make a 401 recurse.
 */
const paths = {
  login: (provider: AuthProvider) => `/v1/auth/${provider}/login`,
  token: '/v1/auth/token',
  refresh: '/v1/auth/refresh',
  logout: '/v1/auth/logout',
  emailRegister: '/v1/auth/email/register',
  emailLogin: '/v1/auth/email/login',
  emailVerify: '/v1/auth/email/verify',
  passwordForgot: '/v1/auth/email/password/forgot',
  passwordReset: '/v1/auth/email/password/reset',
};

/** Keys for this feature, as a factory so they cannot drift apart. */
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  /**
   * A mutation key, not a query key. It is what lets the sign-in's progress be
   * read back out of the cache after the component that started it is gone —
   * see `useSignInStatus`.
   */
  signIn: () => [...authKeys.all, 'sign-in'] as const,
};

/** Spends the one-time auth code, opening a refresh-token family. */
export async function exchangeAuthCode(code: string): Promise<Session> {
  const { data } = await publicApi.post<TokenResponse>(paths.token, { code });
  return toSession(data);
}

/** Rotates the token pair. Callers must serialize this — see `refresh.ts`. */
export async function rotateRefreshToken(
  refreshToken: string,
): Promise<Session> {
  const { data } = await publicApi.post<TokenResponse>(paths.refresh, {
    refresh_token: refreshToken,
  });
  return toSession(data);
}

/** Revokes this session only. Idempotent server-side. */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  await publicApi.post(paths.logout, { refresh_token: refreshToken });
}

export type SignInResult =
  | { status: 'signed-in'; session: Session }
  /** Backed out of the consent screen — not an error, nothing to show. */
  | { status: 'cancelled' };

/**
 * Runs the browser half of the flow: opens the provider's consent screen,
 * waits for the OS to intercept the `aretos://` redirect, and spends the
 * one-time code it carries.
 *
 * The code is good for 60s and exactly one use (`AUTH_CODE_TTL_SEC`), so it is
 * exchanged here rather than handed back to the caller.
 */
export async function signIn(provider: AuthProvider): Promise<SignInResult> {
  const redirectUri = env.authRedirectUri;
  const url = `${env.apiUrl}${paths.login(provider)}?redirect_uri=${encodeURIComponent(redirectUri)}`;

  const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);
  if (result.type !== 'success') return { status: 'cancelled' };

  const code = Linking.parse(result.url).queryParams?.code;

  if (typeof code !== 'string' || !code) {
    // The backend 302s with `?code=…` on success and answers with JSON
    // otherwise, so a redirect without a code means the flow was interrupted.
    throw new ApiError(
      AuthErrorCode.InvalidAuthCode,
      'Sign-in finished without an authorization code.',
    );
  }

  return { status: 'signed-in', session: await exchangeAuthCode(code) };
}

/*
 * Email sign-in. Addresses are trimmed here because the server's email check
 * refuses the trailing space a keyboard's autocomplete leaves; passwords are
 * sent as typed, since a space is a real character in one.
 */

export type RegisterInput = { email: string; password: string; name: string };

/** Creates the account and emails the code that confirms it. */
export async function registerWithEmail({
  email,
  password,
  name,
}: RegisterInput): Promise<CodeSentResponse> {
  const { data } = await publicApi.post<CodeSentResponse>(paths.emailRegister, {
    email: email.trim(),
    password,
    display_name: name.trim(),
  });
  return data;
}

export type LoginInput = { email: string; password: string };

/**
 * Throws `AUTH_EMAIL_NOT_VERIFIED` for the right password on an account whose
 * address was never confirmed; the server has emailed a code by then.
 */
export async function logInWithEmail({
  email,
  password,
}: LoginInput): Promise<Session> {
  const { data } = await publicApi.post<TokenResponse>(paths.emailLogin, {
    email: email.trim(),
    password,
  });
  return toSession(data);
}

export type VerifyInput = { email: string; code: string };

/** Spends a sign-in code, confirming the address if it was not already. */
export async function verifyEmailCode({
  email,
  code,
}: VerifyInput): Promise<Session> {
  const { data } = await publicApi.post<TokenResponse>(paths.emailVerify, {
    email: email.trim(),
    code,
  });
  return toSession(data);
}

/** Emails a reset code. Answers the same whether or not the address exists. */
export async function requestPasswordReset(
  email: string,
): Promise<CodeSentResponse> {
  const { data } = await publicApi.post<CodeSentResponse>(
    paths.passwordForgot,
    { email: email.trim() },
  );
  return data;
}

export type ResetInput = { email: string; code: string; password: string };

/**
 * Sets the new password and starts a session here. Every other device the
 * account was signed in on is signed out by the server.
 */
export async function resetPassword({
  email,
  code,
  password,
}: ResetInput): Promise<Session> {
  const { data } = await publicApi.post<TokenResponse>(paths.passwordReset, {
    email: email.trim(),
    code,
    password,
  });
  return toSession(data);
}
