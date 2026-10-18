import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { watchFrontmatterSchema, type Watch } from "@/lib/schema";
import { decadeOf } from "@/lib/filters";

export { PRICE_BANDS, matchesPriceBand, decadeOf, decadeLabel } from "@/lib/filters";
export type { PriceBand } from "@/lib/filters";

const WATCHES_DIR = path.join(process.cwd(), "content", "watches");

export function getAllWatches(): Watch[] {
  const files = fs.readdirSync(WATCHES_DIR).filter((f) => f.endsWith(".mdx"));

  const watches = files.map((file) => {
    const raw = fs.readFileSync(path.join(WATCHES_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const frontmatter = watchFrontmatterSchema.parse(data);
    // Cena predaného kusu sa nezverejňuje: vynulujem ju hneď pri načítaní, aby sa nedostala
    // do HTML ani do dát posielaných klientským komponentom (katalóg, tlačidlá na detaile).
    if (frontmatter.status === "sold") return { ...frontmatter, price: 0, priceCzk: 0, content };
    return { ...frontmatter, content };
  });

  // Poradie v prehľade: pánske pred dámskymi, v rámci nich zlaté puzdrá na konci, potom od najnovšieho roku.
  return watches.sort(
    (a, b) =>
      Number(a.gender === "women") - Number(b.gender === "women") ||
      Number(isGoldCase(a)) - Number(isGoldCase(b)) ||
      b.year - a.year,
  );
}

// Zlaté = zlatené, pozlátené alebo gold filled puzdro, aj oceľ s pozlátenými detailmi (napr. luneta).
export function isGoldCase(watch: Watch): boolean {
  return /zlat|zlát|gold/i.test(watch.caseMaterial);
}

export function getWatchBySlug(slug: string): Watch | undefined {
  return getAllWatches().find((w) => w.slug === slug);
}

export function getAvailableWatches(): Watch[] {
  return getAllWatches().filter((w) => w.status === "available");
}

// Výber na úvodnú stránku (sezónny, content/homepage.json): najprv vybrané kusy v danom poradí,
// predané a chýbajúce sa preskočia, zvyšok doplnia ostatné kusy na predaj v bežnom poradí.
export function getHomepageWatches(limit = 6): Watch[] {
  const { featured } = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", "homepage.json"), "utf8")) as {
    featured: string[];
  };
  const available = getAvailableWatches();
  const picked = featured.flatMap((slug) => available.filter((w) => w.slug === slug));
  return [...picked, ...available.filter((w) => !picked.includes(w))].slice(0, limit);
}

export function getSoldWatches(): Watch[] {
  return getAllWatches().filter((w) => w.status === "sold");
}

export function getReservedWatches(): Watch[] {
  return getAllWatches().filter((w) => w.status === "reserved");
}

export function getBrands(): string[] {
  return Array.from(new Set(getAllWatches().map((w) => w.brand))).sort();
}

export function getDecades(): string[] {
  return Array.from(new Set(getAllWatches().map((w) => decadeOf(w.year)))).sort();
}

export function getRelatedWatches(watch: Watch, limit = 3): Watch[] {
  return getAllWatches()
    .filter((w) => w.slug !== watch.slug && w.status !== "sold")
    .filter((w) => w.brand === watch.brand || decadeOf(w.year) === decadeOf(watch.year))
    .slice(0, limit);
}
