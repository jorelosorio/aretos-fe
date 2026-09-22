import {
  create,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

import { env } from '@/lib/env';
import { deviceTimezone } from '@/lib/timezone';

import { ApiError, toApiError } from './errors';

const TIMEOUT_MS = 15_000;

/** `v1.TimezoneHeader` — the only way a request says where the person is. */
const TIMEZONE_HEADER = 'X-Timezone';

function createClient(): AxiosInstance {
  const instance = create({
    baseURL: env.apiUrl,
    timeout: TIMEOUT_MS,
    headers: { 'Content-Type': 'application/json' },
  });

  // Normalize on the way out so no caller has to know axios threw it.
  instance.interceptors.response.use(undefined, (error: unknown) =>
    Promise.reject(toApiError(error)),
  );

  return instance;
}

/**
 * No Authorization header, no refresh-on-401. For the endpoints that mint or
 * rotate credentials — sending a refresh through `api` would recurse.
 */
export const publicApi = createClient();

/** The client every feature uses. Carries the session; see `connectAuth`. */
export const api = createClient();

/**
 * What `api` needs from whoever owns the session. Injected rather than
 * imported so `lib/` never depends on `features/`, and so the interceptors
 * can be tested with a fake.
 */
export type AuthBridge = {
  /** Token for an outgoing request, refreshed first if it is close to expiry. */
  getAccessToken(): Promise<string | null>;
  /**
   * Called after a 401. `staleToken` is what the failed request actually sent,
   * so the implementation can skip the network when a concurrent refresh has
   * already produced a newer one. Null means the session is gone for good.
   */
  renewAccessToken(staleToken: string | null): Promise<string | null>;
};

let bridge: AuthBridge | null = null;

export function connectAuth(next: AuthBridge | null) {
  bridge = next;
}

/** Marks a request already replayed, so a 401 loop cannot form. */
const RETRIED = Symbol('retried');
type RetryableConfig = InternalAxiosRequestConfig & { [RETRIED]?: true };

/**
 * The zone rides on every request rather than being a parameter each caller
 * remembers.
 *
 * `/v1/analysis`, `/v1/diary` and `/v1/goals?include=progress` refuse a
 * request without it — there is no stored zone left to fall back on — and a
 * screen that forgot a query parameter would not fail loudly, it would 400.
 * Set here, beside the token, no screen can forget. `publicApi` is left out:
 * the endpoints that mint credentials never ask what day it is.
 */
api.interceptors.request.use(async (config) => {
  const token = await bridge?.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers[TIMEZONE_HEADER] = deviceTimezone();
  return config;
});

api.interceptors.response.use(undefined, async (error: unknown) => {
  const config = (error as { config?: RetryableConfig }).config;

  const canRetry =
    error instanceof ApiError &&
    error.status === 401 &&
    bridge !== null &&
    config !== undefined &&
    config[RETRIED] !== true;

  if (!canRetry) throw error;

  const sent = config.headers.Authorization;
  const staleToken =
    typeof sent === 'string' ? sent.replace(/^Bearer /, '') : null;

  const token = await bridge!.renewAccessToken(staleToken);
  if (!token) throw error;

  config[RETRIED] = true;
  config.headers.Authorization = `Bearer ${token}`;
  return api.request(config);
});
