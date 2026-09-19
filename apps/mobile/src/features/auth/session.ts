import * as SecureStore from 'expo-secure-store';

import type { Session, TokenResponse } from './types';

const STORAGE_KEY = 'aretos.session';

/**
 * The refresh token is a 30-day bearer credential, so it lives in the Keychain
 * / Android Keystore. `AFTER_FIRST_UNLOCK` lets a refresh read it after a
 * reboot without the user unlocking first.
 */
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

/**
 * How far ahead of real expiry a token counts as spent. Covers the request's
 * own flight time, so a token never dies between leaving the device and
 * reaching the API.
 */
export const EXPIRY_SKEW_MS = 60_000;

export const isExpiring = (expiresAt: number) =>
  expiresAt - Date.now() <= EXPIRY_SKEW_MS;

/** Milliseconds until a session should be refreshed; never negative. */
export const msUntilRefresh = (expiresAt: number) =>
  Math.max(0, expiresAt - EXPIRY_SKEW_MS - Date.now());

/**
 * Reads claims out of an access token **without verifying it** — the API holds
 * the signing secret and is the only thing that verifies. Display and
 * client-side tier gating only; never treat it as proof.
 *
 * Aretos' claims are ASCII (a uuid and a tier slug), so `atob`'s binary string
 * goes straight to `JSON.parse` with no UTF-8 decoding.
 */
function decodeClaims(token: string): { sub?: string; tier?: string } {
  const payload = token.split('.')[1];
  if (!payload) return {};

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(
      atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')),
    );
  } catch {
    return {};
  }
}

export function toSession(response: TokenResponse): Session {
  const claims = decodeClaims(response.access_token);

  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    // `expires_in` rather than the JWT's `exp`: it is relative, so a device
    // clock that disagrees with the server does not move the deadline.
    expiresAt: Date.now() + response.expires_in * 1000,
    userId: claims.sub ?? '',
    tier: claims.tier ?? 'free',
  };
}

/**
 * The single source of truth for the current session.
 *
 * It lives outside React because the axios interceptors need it synchronously
 * and are not components. React subscribes through `useSyncExternalStore`, so
 * both sides always see the same object.
 */
class SessionStore {
  private session: Session | null = null;
  private listeners = new Set<() => void>();
  private hydrated = false;

  /** Stable between writes, which `useSyncExternalStore` requires. */
  get = (): Session | null => this.session;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => void this.listeners.delete(listener);
  };

  /** Reads from the Keychain once; later calls reuse the result. */
  hydrate = async (): Promise<Session | null> => {
    if (this.hydrated) return this.session;

    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY, OPTIONS);
      // A shape change in a past release would otherwise crash every launch.
      this.session = raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      this.session = null;
    }

    this.hydrated = true;
    this.emit();
    return this.session;
  };

  set = async (session: Session): Promise<Session> => {
    this.swap(session);
    // Written after the in-memory swap: a Keychain failure must not leave
    // requests signing with a token that was already rotated away.
    await SecureStore.setItemAsync(
      STORAGE_KEY,
      JSON.stringify(session),
      OPTIONS,
    );
    return session;
  };

  clear = async () => {
    this.swap(null);
    await SecureStore.deleteItemAsync(STORAGE_KEY, OPTIONS);
  };

  private swap(session: Session | null) {
    this.session = session;
    this.hydrated = true;
    this.emit();
  }

  private emit() {
    for (const listener of this.listeners) listener();
  }
}

export const sessionStore = new SessionStore();
