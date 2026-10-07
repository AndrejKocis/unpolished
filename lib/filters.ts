import type { Watch } from "@/lib/schema";

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

// Filtrovanie a triedenie katalógu podľa URL parametrov (/watches?brand=…&sort=…).
export function filterWatches(all: Watch[], sp: URLSearchParams): Watch[] {
  let watches = all;

  const selectedBrands = (sp.get("brand") ?? "").split(",").filter(Boolean);
  if (selectedBrands.length > 0) {
    watches = watches.filter((w) => selectedBrands.includes(w.brand));
  }
  const decade = sp.get("decade");
  if (decade) {
    watches = watches.filter((w) => decadeOf(w.year) === decade);
  }
  const price = sp.get("price");
  if (price) {
    // Predané kusy nemajú zverejnenú cenu (price 0), do cenových pásiem preto nepatria.
    watches = watches.filter((w) => w.status !== "sold" && matchesPriceBand(w.price, price));
  }
  const gender = sp.get("gender");
  if (gender === "women" || gender === "men") {
    watches = watches.filter((w) => w.gender === gender || w.gender === "unisex");
  }

  const sort = sp.get("sort");
  if (sort === "price-asc") {
    watches = [...watches].sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    watches = [...watches].sort((a, b) => b.price - a.price);
  } else if (sort === "oldest") {
    watches = [...watches].sort((a, b) => a.year - b.year);
  }
  // Predané kusy ostávajú v prehľade ako referencia, vždy až za tými, ktoré sú na predaj.
  return [...watches.filter((w) => w.status !== "sold"), ...watches.filter((w) => w.status === "sold")];
}
