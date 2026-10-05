import type { ReactNode } from "react";
import { getLocale } from "@/lib/i18n/server";
import { LOCALES, type Locale } from "@/lib/i18n/locale";
import { IS_STATIC_EXPORT } from "@/lib/constants";
import { LocaleSwitch } from "@/components/LocaleProvider";

// Vyrenderuje obsah závislý od jazyka. Server ho renderuje v jazyku z cookie;
// statický export nemá request, preto vyrenderuje všetky verzie a prehliadač ukáže aktívnu.
export async function Localized({ children }: { children: (locale: Locale) => ReactNode }) {
  if (!IS_STATIC_EXPORT) return children(await getLocale());
  const versions = Object.fromEntries(LOCALES.map((locale) => [locale, children(locale)])) as Record<Locale, ReactNode>;
  return <LocaleSwitch {...versions} />;
}
