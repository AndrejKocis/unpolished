import type { ReactNode } from "react";
import { getLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/locale";
import { IS_STATIC_EXPORT } from "@/lib/constants";
import { LocaleSwitch } from "@/components/LocaleProvider";

// Vyrenderuje obsah závislý od jazyka. Server ho renderuje v jazyku z cookie;
// statický export nemá request, preto vyrenderuje obe verzie a prehliadač ukáže aktívnu.
export async function Localized({ children }: { children: (locale: Locale) => ReactNode }) {
  if (!IS_STATIC_EXPORT) return children(await getLocale());
  return <LocaleSwitch sk={children("sk")} en={children("en")} />;
}
