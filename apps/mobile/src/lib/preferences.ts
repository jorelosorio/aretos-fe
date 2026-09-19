import { useSyncExternalStore } from 'react';
import * as SecureStore from 'expo-secure-store';

import type { AppLocale } from './i18n';

/**
 * The user's display preferences.
 *
 * `lib/` rather than `features/` because this is infrastructure the app is
 * built on rather than a domain: `lib/i18n` reads the locale and the root
 * layout reads the theme, and `lib/` may not import upwards. The import above
 * is `import type`, which is erased at build time, so the two modules do not
 * form a runtime cycle.
 */

/** `'system'` follows the device instead of pinning a value. */
export type ThemePreference = 'light' | 'dark' | 'system';
export type LocalePreference = AppLocale | 'system';

export type Preferences = {
  theme: ThemePreference;
  locale: LocalePreference;
};

const STORAGE_KEY = 'aretos.preferences';

const DEFAULTS: Preferences = { theme: 'system', locale: 'system' };

/**
 * Read synchronously at module load, which is what stops the app painting once
 * in the device's theme and again in the chosen one. Two short strings, so the
 * blocking read costs single-digit milliseconds.
 *
 * SecureStore is the Keychain and a theme is not a secret. It is used here
 * because it is the only storage the app already depends on, and pulling in a
 * native dependency for two strings is the worse trade. If preferences grow,
 * this function and `write` are the whole surface to move to AsyncStorage.
 */
function read(): Preferences {
  try {
    const raw = SecureStore.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;

    // Spread over the defaults: a key added in a later release is absent from
    // everything written before it, and `undefined` is not a valid preference.
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return DEFAULTS;
  }
}

/**
 * The single source of truth for preferences, outside React for the same
 * reason `features/auth/session.ts` is: the i18n helper and the root layout
 * both read it, and neither wants a provider threaded through it.
 */
class PreferenceStore {
  private preferences = read();
  private listeners = new Set<() => void>();

  /** Stable between writes, which `useSyncExternalStore` requires. */
  get = (): Preferences => this.preferences;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => void this.listeners.delete(listener);
  };

  /** Pass only the keys that change. */
  set = (patch: Partial<Preferences>) => {
    this.preferences = { ...this.preferences, ...patch };
    for (const listener of this.listeners) listener();

    try {
      // After the in-memory swap and the notify: the change the user just made
      // should show up even on a device where the Keychain write fails.
      SecureStore.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
    } catch {
      // Costs the preference on next launch. Not worth an alert.
    }
  };
}

const store = new PreferenceStore();

/** Subscribes a component to the current preferences. */
export function usePreferences(): Preferences {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

/** Writes a preference. Stable identity, so it needs no hook. */
export const setPreferences = store.set;
