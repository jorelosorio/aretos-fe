/**
 * Jest does not load `.env` the way the Expo CLI does, and `lib/env.ts`
 * refuses to build a client without these. No test reaches a server — the
 * ones that touch `lib/api` mock it — so any well-formed value will do.
 */
process.env.EXPO_PUBLIC_API_URL ??= 'http://api.test';
process.env.EXPO_PUBLIC_AUTH_REDIRECT_URI ??= 'aretos://auth/callback';
