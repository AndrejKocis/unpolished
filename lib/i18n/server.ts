import { cookies } from "next/headers";
import { parseLocale, type Locale } from "@/lib/i18n/locale";
import { dictionaries, type Dictionary } from "@/lib/i18n/dictionaries";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return parseLocale(store.get("locale")?.value);
}

export async function getDictionary(): Promise<Dictionary> {
  const locale = await getLocale();
  return dictionaries[locale];
}
