"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

// Výška pripnutej hlavičky (Nav: h-14).
const HEADER_PX = 56;

// Lišta filtrov sa pripne pod hlavičku. Pri rolovaní dole sa schová, pri rolovaní späť hore
// sa ukáže — filtre sú tak po ruke bez toho, aby stále zakrývali hodinky.
function useStickyToolbar() {
  const ref = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    function onScroll() {
      const el = ref.current;
      if (!el) return;
      const y = window.scrollY;
      const isStuck = el.getBoundingClientRect().top <= HEADER_PX + 1 && y > 0;
      setStuck(isStuck);
      // Malé posuny ignoruj, aby lišta neblikala.
      if (Math.abs(y - lastY) < 6) return;
      setHidden(isStuck && y > lastY);
      lastY = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { ref, stuck, hidden };
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

  const toolbar = useStickyToolbar();

  return (
    <>
      <div
        ref={toolbar.ref}
        className={[
          "sticky top-14 z-20 bg-white transition-[transform,border-color] duration-300 ease-out border-b",
          toolbar.stuck ? "border-line" : "border-transparent",
          toolbar.hidden ? "-translate-y-full" : "translate-y-0",
        ].join(" ")}
      >
      <div
        className={[
          "mx-auto max-w-[1280px] px-4 sm:px-6 flex flex-wrap items-center justify-between transition-[padding] duration-300",
          // Pripnutá lišta je kompaktnejšia, aby nezaberala veľa z obrazovky.
          toolbar.stuck ? "py-3 gap-x-4 gap-y-2" : "py-6 gap-4",
        ].join(" ")}
      >
        <div className="flex items-center gap-4">
          <FilterPanel brands={brands} searchParams={sp} />
          <p className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted">
            {watches.length}{" "}
            {watches.length === 1
              ? dict.watches.resultsOne
              : watches.length <= 4 && watches.length > 1
                ? dict.watches.resultsFew
                : dict.watches.resultsMany}
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
      </div>

      <WatchGrid watches={watches} locale={locale} priorityCount={3} />
    </>
  );
}
