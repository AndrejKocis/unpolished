import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllWatches, getBrands } from "@/lib/watches";
import { SectionDivider } from "@/components/SectionDivider";
import { WatchCatalog, WatchCatalogFromUrl } from "@/components/WatchCatalog";
import { Localized } from "@/components/Localized";
import { getLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = dictionaries[locale];
  return {
    title: dict.watches.title,
    description:
      locale === "sk"
        ? "Katalóg neleštených vintage hodiniek."
        : "Catalogue of unpolished vintage watches.",
  };
}

export default function WatchesPage() {
  const watches = getAllWatches();
  const brands = getBrands();

  return (
    <Localized>
      {(locale) => (
        <div>
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8 sm:py-12">
            <h1 className="font-serif text-24 sm:text-32">{dictionaries[locale].watches.title}</h1>
          </div>

          <SectionDivider />

          <Suspense fallback={<WatchCatalog watches={watches} brands={brands} locale={locale} query="" />}>
            <WatchCatalogFromUrl watches={watches} brands={brands} locale={locale} />
          </Suspense>
        </div>
      )}
    </Localized>
  );
}
