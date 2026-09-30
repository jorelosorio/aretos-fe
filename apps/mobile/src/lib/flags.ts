import { useCallback, useSyncExternalStore } from 'react';
import * as SecureStore from 'expo-secure-store';

/**
 * Small facts the app remembers about a person or a phone — "the tutorial
 * still has to be shown", "this notice was dismissed" — as opposed to their
 * data, which is the server's.
 *
 * To add one, give it a type in `Flags` and a scope and starting value in
 * `FLAGS`. Anything JSON can hold works: a boolean, a string or a union of
 * strings, a number, a small object.
 *
 * - `user` flags belong to the signed-in account and are stored under its id,
 *   so a second account on the same phone starts with its own, and signing out
 *   and back in keeps them. With nobody signed in they read as their starting
 *   value and ignore writes.
 * - `device` flags belong to the phone, whoever is signed in.
 *
 * Stored in SecureStore, which on Android is SharedPreferences and on iOS the
 * Keychain — the storage the app already ships, so flags cost no native
 * dependency. Keychain items outlive an uninstall on iOS, so a reinstall there
 * keeps its flags; on Android an uninstall clears them. Each flag is its own
 * key rather than one shared blob, so no value approaches SecureStore's size
 * warning however many flags there are.
 */

export type Flags = {
  /** The guide opens by itself until it has been left once, finished or not. */
  guidePending: boolean;
};

export type FlagName = keyof Flags;
export type FlagScope = 'user' | 'device';

const FLAGS: { [K in FlagName]: { scope: FlagScope; initial: Flags[K] } } = {
  guidePending: { scope: 'user', initial: true },
};

const PREFIX = 'aretos.flag';

/**
 * Where a flag is stored, or null when a `user` flag has no account to belong
 * to. SecureStore keys may only hold letters, digits, `.`, `-` and `_`, which
 * a uuid and a camelCase flag name both satisfy.
 */
export function flagKey(
  scope: FlagScope,
  name: string,
  owner: string | null,
): string | null {
  if (scope === 'device') return `${PREFIX}.device.${name}`;
  return owner ? `${PREFIX}.user.${owner}.${name}` : null;
}

function kindOf(value: unknown) {
  if (value === null) return 'null';
  return Array.isArray(value) ? 'array' : typeof value;
}

/**
 * A stored flag, or its starting value when there is nothing usable. A value
 * written by an older release under a different type is treated as unset
 * rather than handed to code that expects the new one. Only the kind is
 * checked: a string flag narrowed to a union still accepts any string.
 */
export function parseFlag<T>(raw: string | null, initial: T): T {
  if (raw === null) return initial;

  try {
    const value: unknown = JSON.parse(raw);
    return kindOf(value) === kindOf(initial) ? (value as T) : initial;
  } catch {
    return initial;
  }
}

/**
 * The single source of truth for flags, outside React like the session and
 * the preferences, so a mutation's callback can read or write one as easily
 * as a component can.
 */
class FlagStore {
  private owner: string | null = null;
  private values = new Map<string, unknown>();
  private listeners = new Set<() => void>();
  private pendingWrite: Promise<unknown> = Promise.resolve();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => void this.listeners.delete(listener);
  };

  setOwner = (owner: string | null) => {
    if (owner === this.owner) return;
    this.owner = owner;
    this.emit();
  };

  /**
   * Read from storage the first time, from memory after. Synchronous, so a
   * screen never renders once with the starting value and again with the
   * stored one; a flag is a few bytes, so the blocking read is cheap. The
   * cached value is what makes the result stable between reads, which
   * `useSyncExternalStore` requires of an object-valued flag.
   */
  get = <K extends FlagName>(name: K): Flags[K] => {
    const { scope, initial } = FLAGS[name];
    const key = flagKey(scope, name, this.owner);
    if (key === null) return initial;

    if (!this.values.has(key)) {
      let raw: string | null = null;
      try {
        raw = SecureStore.getItem(key);
      } catch {
        // An unreadable Keychain reads as unset rather than crashing a screen.
      }
      this.values.set(key, parseFlag(raw, initial));
    }
    return this.values.get(key) as Flags[K];
  };

  set = <K extends FlagName>(name: K, value: Flags[K]) => {
    const key = flagKey(FLAGS[name].scope, name, this.owner);
    if (key === null) return;

    this.values.set(key, value);
    this.emit();
    this.persist(() => SecureStore.setItemAsync(key, JSON.stringify(value)));
  };

  /** Back to the starting value, and off the disk. */
  reset = (name: FlagName) => {
    const key = flagKey(FLAGS[name].scope, name, this.owner);
    if (key === null) return;

    this.values.set(key, FLAGS[name].initial);
    this.emit();
    this.persist(() => SecureStore.deleteItemAsync(key));
  };

  /**
   * Async, unlike the read: writes come from press handlers, where a blocking
   * Keychain write would hold the JS thread before React can paint. Chained so
   * two quick writes land on disk in the order they were made. A failed write
   * costs the flag on the next launch only; the running app already has it.
   */
  private persist(write: () => Promise<void>) {
    this.pendingWrite = this.pendingWrite.then(write).catch(() => undefined);
  }

  private emit() {
    for (const listener of this.listeners) listener();
  }
}

const store = new FlagStore();

/** A flag and its setter, like `useState`, kept in step across the app. */
export function useFlag<K extends FlagName>(name: K) {
  const read = useCallback(() => store.get(name), [name]);
  const value = useSyncExternalStore(store.subscribe, read, read);
  const set = useCallback((next: Flags[K]) => store.set(name, next), [name]);

  return [value, set] as const;
}

/** For code outside components. Stable identities, so they need no hook. */
export const getFlag = store.get;
export const setFlag = store.set;
export const resetFlag = store.reset;

/**
 * Who `user` flags belong to. Called by the auth feature whenever the session
 * changes, because `lib/` may not import it to ask.
 */
export const setFlagOwner = store.setOwner;
