"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Watch } from "@/lib/schema";
import type { Locale } from "@/lib/i18n/locale";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { filterWatches } from "@/lib/filters";
import { WatchGrid } from "@/components/WatchGrid";
import { FilterPanel } from "@/components/FilterPanel";
import { SortSelect } from "@/components/SortSelect";

type Props = { watches: Watch[]; brands: string[]; locale: Locale };

// Filtre žijú v URL a vyhodnocujú sa v prehliadači, aby katalóg fungoval aj ako statický export.
export function WatchCatalogFromUrl(props: Props) {
  return <WatchCatalog {...props} query={useSearchParams().toString()} />;
}

// `query` je prázdne pri predrenderovaní (fallback Suspense), kým prehliadač nedodá URL parametre.
export function WatchCatalog({ watches: all, brands, locale, query }: Props & { query: string }) {
  const dict = dictionaries[locale];
  const sp = new URLSearchParams(query);
  const watches = filterWatches(all, sp);
  const gender = sp.get("gender") ?? undefined;

  const hrefWith = (overrides: { gender?: string }) => {
    const params = new URLSearchParams();
    const nextGender = "gender" in overrides ? overrides.gender : gender;
    for (const key of ["brand", "decade", "price", "sort", "sold"]) {
      const value = sp.get(key);
      if (value) params.set(key, value);
    }
    if (nextGender) params.set("gender", nextGender);
    const qs = params.toString();
    return qs ? `/watches?${qs}` : "/watches";
  };

  const genderTabs = [
    { value: undefined, label: dict.watches.genderAll },
    { value: "women", label: dict.watches.genderWomen },
    { value: "men", label: dict.watches.genderMen },
  ] as const;

  return (
    <>
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <FilterPanel brands={brands} searchParams={sp} />
          <p className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted">
            {watches.length} {watches.length === 1 ? dict.watches.resultsOne : dict.watches.resultsMany}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
        <SortSelect searchParams={sp} />
        <nav className="flex items-center gap-4">
          {genderTabs.map((tab) => {
            const isActive = gender === tab.value;
            return (
              <Link
                key={tab.label}
                href={hrefWith({ gender: tab.value })}
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
      </div>

      <WatchGrid watches={watches} locale={locale} priorityCount={3} />
    </>
  );
}
