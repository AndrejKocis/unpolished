import { cookies } from "next/headers";
import { DEFAULT_LOCALE, parseLocale, type Locale } from "@/lib/i18n/locale";
import { dictionaries, type Dictionary } from "@/lib/i18n/dictionaries";
import { IS_STATIC_EXPORT } from "@/lib/constants";

export async function getLocale(): Promise<Locale> {
  // Statický export nemá request: stránky sa predrenderujú v predvolenom jazyku
  // a jazyk z cookie prepne až prehliadač (pozri Localized / LocaleProvider).
  if (IS_STATIC_EXPORT) return DEFAULT_LOCALE;
  const store = await cookies();
  return parseLocale(store.get("locale")?.value);
}

export async function getDictionary(): Promise<Dictionary> {
  const locale = await getLocale();
  return dictionaries[locale];
}
