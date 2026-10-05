export type Locale = "cs" | "sk" | "en";
export const LOCALES: readonly Locale[] = ["cs", "sk", "en"];
export const DEFAULT_LOCALE: Locale = "cs";
export const LOCALE_COOKIE = "locale";

export function parseLocale(value: string | undefined): Locale {
  return LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}

export function readLocaleCookie(cookie: string): Locale {
  return parseLocale(cookie.match(/(?:^|;\s*)locale=([^;]*)/)?.[1]);
}
