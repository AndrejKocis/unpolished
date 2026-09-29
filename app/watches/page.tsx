import type { Metadata } from "next";
import Link from "next/link";
import { decadeOf, getAllWatches, matchesPriceBand } from "@/lib/watches";
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
  gender?: string;
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
  if (sp.gender === "women" || sp.gender === "men") {
    watches = watches.filter((w) => w.gender === sp.gender || w.gender === "unisex");
  }

  if (sp.sort === "price-asc") {
    watches = [...watches].sort((a, b) => a.price - b.price);
  } else if (sp.sort === "price-desc") {
    watches = [...watches].sort((a, b) => b.price - a.price);
  }

  const genderHref = (value?: string) => {
    const params = new URLSearchParams();
    if (sp.brand) params.set("brand", sp.brand);
    if (sp.decade) params.set("decade", sp.decade);
    if (sp.price) params.set("price", sp.price);
    if (sp.sort) params.set("sort", sp.sort);
    if (sp.sold) params.set("sold", sp.sold);
    if (value) params.set("gender", value);
    const qs = params.toString();
    return qs ? `/watches?${qs}` : "/watches";
  };

  const genderTabs = [
    { value: undefined, label: dict.watches.genderAll },
    { value: "women", label: dict.watches.genderWomen },
    { value: "men", label: dict.watches.genderMen },
  ] as const;

  return (
    <div>
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="font-serif text-24 sm:text-32">{dict.watches.title}</h1>
      </div>

      <SectionDivider />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted">
          {watches.length} {watches.length === 1 ? dict.watches.resultsOne : dict.watches.resultsMany}
        </p>

        <nav className="flex items-center gap-4">
          {genderTabs.map((tab) => {
            const isActive = (sp.gender ?? undefined) === tab.value;
            return (
              <Link
                key={tab.label}
                href={genderHref(tab.value)}
                className={[
                  "font-mono text-11 uppercase tracking-[0.06em] pb-1 border-b",
                  isActive ? "text-ink border-ink" : "text-ink-muted border-transparent hover:text-ink",
                ].join(" ")}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <WatchGrid watches={watches} locale={locale} priorityCount={3} />
    </div>
  );
}
