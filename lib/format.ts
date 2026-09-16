import type { Locale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const INTL_LOCALE: Record<Locale, string> = { sk: "sk-SK", en: "en-IE" };

export function formatPrice(price: number, currency: string, locale: Locale = "sk"): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(iso: string, locale: Locale = "sk"): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function statusBadgeLabel(status: string, dict: Dictionary): string | null {
  if (status === "reserved") return dict.watchCard.reserved;
  if (status === "sold") return dict.watchCard.sold;
  return null;
}
