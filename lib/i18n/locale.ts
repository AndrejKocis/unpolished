export type Locale = "sk" | "en";
export const DEFAULT_LOCALE: Locale = "sk";
export const LOCALE_COOKIE = "locale";

export function parseLocale(value: string | undefined): Locale {
  return value === "en" ? "en" : DEFAULT_LOCALE;
}
