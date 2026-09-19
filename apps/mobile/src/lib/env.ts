/**
 * Runtime configuration, read from Expo's `EXPO_PUBLIC_*` env vars at bundle
 * time. See `.env.example` for the values and why each one matters.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and restart the bundler ` +
        `with --clear (EXPO_PUBLIC_* vars are inlined at build time).`,
    );
  }
  return value;
}

export const env = {
  /** Base URL of aretos-be, without a trailing slash. */
  apiUrl: required(
    'EXPO_PUBLIC_API_URL',
    process.env.EXPO_PUBLIC_API_URL,
  ).replace(/\/+$/, ''),

  /**
   * Where the backend hands the one-time auth code back to the app. The
   * backend compares this against AUTH_ALLOWED_REDIRECT_URIS with an exact
   * string match, so it is configured rather than derived from
   * `Linking.createURL()` — that would produce an `exp://…` URL under Expo Go
   * and be rejected.
   */
  authRedirectUri: required(
    'EXPO_PUBLIC_AUTH_REDIRECT_URI',
    process.env.EXPO_PUBLIC_AUTH_REDIRECT_URI,
  ),
} as const;
