/** Providers registered in the backend's `internal/auth/runtime.go`. */
export type AuthProvider = 'google';

/** Tiers from `internal/shared`; gates API access via the Casbin policy. */
export type Tier = 'free' | (string & {});

/** Response body of `/v1/auth/token` and `/v1/auth/refresh`. */
export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  /** Access token lifetime in seconds. Relative, so clock skew cannot shift it. */
  expires_in: number;
};

/**
 * The 202 from every route that emails a code, sent whether or not the address
 * has an account. Nothing else comes back, so the app cannot tell either.
 */
export type CodeSentResponse = {
  /** How long the code works, in seconds. */
  expires_in: number;
  /** Seconds before asking again sends anything; earlier requests are no-ops. */
  resend_after: number;
};

/** Everything the app knows about the signed-in user. Persisted verbatim. */
export type Session = {
  accessToken: string;
  refreshToken: string;
  /** Absolute epoch ms when the access token stops being accepted. */
  expiresAt: number;
  userId: string;
  tier: Tier;
};

/**
 * The subset of `internal/api/errors/codes.go` this feature reacts to.
 * Anything else falls through to a generic message.
 */
export const AuthErrorCode = {
  InvalidRefreshToken: 'AUTH_INVALID_REFRESH_TOKEN',
  /** The whole refresh family was revoked — every device is signed out. */
  RefreshReuseDetected: 'AUTH_REFRESH_REUSE_DETECTED',
  RedirectNotAllowed: 'AUTH_REDIRECT_NOT_ALLOWED',
  InvalidOAuthState: 'AUTH_INVALID_OAUTH_STATE',
  InvalidAuthCode: 'AUTH_INVALID_AUTH_CODE',
  ProviderAuthFailed: 'AUTH_PROVIDER_AUTH_FAILED',
  /**
   * From Google, an address it never verified. From the email log in, the
   * right password on an unconfirmed account — a fresh code is on its way.
   */
  EmailNotVerified: 'AUTH_EMAIL_NOT_VERIFIED',
  /** Wrong password and unknown address alike, so neither is revealed. */
  InvalidCredentials: 'AUTH_INVALID_CREDENTIALS',
  /** Wrong, expired, used up or out of guesses; the server does not say which. */
  InvalidEmailCode: 'AUTH_INVALID_EMAIL_CODE',
  WeakPassword: 'AUTH_WEAK_PASSWORD',
  TierNotAllowed: 'AUTHZ_TIER_NOT_ALLOWED',
} as const;
