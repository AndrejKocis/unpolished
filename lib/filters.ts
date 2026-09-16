export const PRICE_BANDS = [
  { value: "under-500", label: "Do 500 €" },
  { value: "500-1500", label: "500–1500 €" },
  { value: "over-1500", label: "1500 € a viac" },
] as const;

export type PriceBand = (typeof PRICE_BANDS)[number]["value"];

export function matchesPriceBand(price: number, band: string): boolean {
  if (band === "under-500") return price < 500;
  if (band === "500-1500") return price >= 500 && price <= 1500;
  if (band === "over-1500") return price > 1500;
  return true;
}

export function decadeOf(year: number): string {
  return `${Math.floor(year / 10) * 10}s`;
}

export function decadeLabel(decade: string): string {
  return decade.replace("19", "").replace("20", "");
}
