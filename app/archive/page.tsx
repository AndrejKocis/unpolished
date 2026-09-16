import type { Metadata } from "next";
import { getSoldWatches } from "@/lib/watches";
import { WatchGrid } from "@/components/WatchGrid";
import { SectionDivider } from "@/components/SectionDivider";
import { getLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = dictionaries[locale];
  return {
    title: dict.archive.title,
    description:
      locale === "sk" ? "Predané kusy z nášho inventára." : "Sold pieces from our inventory.",
  };
}

export default async function ArchivePage() {
  const locale = await getLocale();
  const dict = dictionaries[locale];
  const sold = getSoldWatches();

  return (
    <div>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="font-serif text-24 sm:text-32">{dict.archive.title}</h1>
        <p className="text-15 text-ink-muted mt-2">{dict.archive.subtitle}</p>
      </div>

      <SectionDivider />

      <WatchGrid watches={sold} locale={locale} />
    </div>
  );
}
