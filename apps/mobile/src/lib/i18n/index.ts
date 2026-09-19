import { useCallback, useMemo } from 'react';
import { useLocales } from 'expo-localization';
import { I18n, type TranslateOptions } from 'i18n-js';

import { usePreferences } from '../preferences';
import { en } from './locales/en';
import { es, type Translations } from './locales/es';

const resources = { es, en };

export type AppLocale = keyof typeof resources;

/** Every locale the app ships, in the order settings should list them. */
export const APP_LOCALES = ['en', 'es'] as const satisfies readonly AppLocale[];

const DEFAULT_LOCALE: AppLocale = 'es';

/** Dot paths to every leaf: `'tabs.home' | 'home.logEntry' | …` */
type LeafKeys<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${LeafKeys<T[K]>}`;
}[keyof T & string];

export type TranslationKey = LeafKeys<Translations>;

export type TranslateFn = (
  key: TranslationKey,
  options?: TranslateOptions,
) => string;

const i18n = new I18n(resources, {
  defaultLocale: DEFAULT_LOCALE,
  enableFallback: true,
});

// `hasOwn`, not `in`: `in` also matches inherited Object.prototype keys
const isSupported = (code: string | null): code is AppLocale =>
  code !== null && Object.hasOwn(resources, code);

function resolveLocale(
  preferences: readonly { languageCode: string | null }[],
): AppLocale {
  for (const { languageCode } of preferences) {
    if (isSupported(languageCode)) return languageCode;
  }
  return DEFAULT_LOCALE;
}

export function useTranslations() {
  const { locale: preference } = usePreferences();
  const device = useLocales();

  // An explicit choice wins; `'system'` falls back to the device's own order
  // of preferred languages, which is the behaviour before anyone visits
  // settings and the default this app ships with.
  const locale = preference === 'system' ? resolveLocale(device) : preference;

  const t = useCallback<TranslateFn>(
    (key, options) => i18n.t(key, { locale, ...options }),
    [locale],
  );

  // stable identity so the result is safe to use as a hook dependency
  return useMemo(() => ({ t, locale }), [t, locale]);
}
