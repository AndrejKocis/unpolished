import type { Locale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Watch } from "@/lib/schema";

const INTL_LOCALE: Record<Locale, string> = { cs: "cs-CZ", sk: "sk-SK", en: "en-IE" };

// Česká verzia ukazuje cenu v Kč (priceCzk), slovenská a anglická v eurách (price).
export function formatWatchPrice(watch: Pick<Watch, "price" | "priceCzk" | "currency">, locale: Locale): string {
  const [amount, currency] = locale === "cs" ? [watch.priceCzk, "CZK"] : [watch.price, watch.currency];
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function statusBadgeLabel(status: string, dict: Dictionary): string | null {
  if (status === "reserved") return dict.watchCard.reserved;
  if (status === "sold") return dict.watchCard.sold;
  return null;
}

// „Značka Model ref. 1234“ — referenciu pridá, len ak ju hodinky majú.
export function watchLabel(watch: Pick<Watch, "brand" | "model" | "reference">): string {
  const name = `${watch.brand} ${watch.model}`;
  return watch.reference ? `${name} ref. ${watch.reference}` : name;
}

// Základné texty v súbore sú slovenské; preklady sú v poliach `cs` a `en`.
export function localizeWatch(watch: Watch, locale: Locale): Watch {
  if (locale === "sk") return watch;
  const { content, ...fields } = watch[locale];
  return { ...watch, ...fields, content };
}

// „modrý ciferník“ / „blue dial“ — prvá časť poľa Ciferník.
export function dialLabel(watch: Watch, locale: Locale): string {
  const color = localizeWatch(watch, locale).dial.split(",")[0].toLowerCase();
  return locale === "en" ? `${color} dial` : `${color} ciferník`;
}
