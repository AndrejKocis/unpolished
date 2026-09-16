import type { Metadata } from "next";
import {
  decadeOf,
  getAllWatches,
  getBrands,
  getDecades,
  matchesPriceBand,
} from "@/lib/watches";
import { WatchFilters } from "@/components/WatchFilters";
import { WatchGrid } from "@/components/WatchGrid";
import { SectionDivider } from "@/components/SectionDivider";
import { getLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = dictionaries[locale];
  return {
    title: dict.watches.title,
    description:
      locale === "sk"
        ? "Katalóg nepolírovaných vintage hodiniek."
        : "Catalogue of unpolished vintage watches.",
  };
}

type SearchParams = Promise<{
  brand?: string;
  decade?: string;
  price?: string;
  sort?: string;
  sold?: string;
}>;

export default async function WatchesPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = await getLocale();
  const dict = dictionaries[locale];
  const sp = await searchParams;
  const showSold = sp.sold === "1";

  let watches = showSold
    ? getAllWatches()
    : getAllWatches().filter((w) => w.status !== "sold");

  if (sp.brand) {
    watches = watches.filter((w) => w.brand === sp.brand);
  }
  if (sp.decade) {
    watches = watches.filter((w) => decadeOf(w.year) === sp.decade);
  }
  if (sp.price) {
    watches = watches.filter((w) => matchesPriceBand(w.price, sp.price!));
  }

  if (sp.sort === "price-asc") {
    watches = [...watches].sort((a, b) => a.price - b.price);
  } else if (sp.sort === "price-desc") {
    watches = [...watches].sort((a, b) => b.price - a.price);
  }

  return (
    <div>
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="font-serif text-24 sm:text-32">{dict.watches.title}</h1>
      </div>

      <SectionDivider />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6">
        <WatchFilters
          brands={getBrands()}
          decades={getDecades()}
          current={{
            brand: sp.brand,
            decade: sp.decade,
            price: sp.price,
            sort: sp.sort,
            sold: showSold,
          }}
        />
        <p className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted mt-6">
          {watches.length} {watches.length === 1 ? dict.watches.resultsOne : dict.watches.resultsMany}
        </p>
      </div>

      <WatchGrid watches={watches} locale={locale} priorityCount={3} />
    </div>
  );
}
