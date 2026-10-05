import type { Metadata } from "next";
import { getSoldWatches } from "@/lib/watches";
import { WatchGrid } from "@/components/WatchGrid";
import { SectionDivider } from "@/components/SectionDivider";
import { getLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Watch } from "@/lib/schema";
import type { Locale } from "@/lib/i18n/locale";
import { Localized } from "@/components/Localized";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = dictionaries[locale];
  return {
    title: dict.archive.title,
    description: dict.archive.metaDescription,
  };
}

export default function ArchivePage() {
  const sold = getSoldWatches();
  return <Localized>{(locale) => <ArchiveContent locale={locale} sold={sold} />}</Localized>;
}

function ArchiveContent({ locale, sold }: { locale: Locale; sold: Watch[] }) {
  const dict = dictionaries[locale];

  return (
    <div>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="font-serif text-24 sm:text-32">{dict.archive.title}</h1>
        <p className="text-15 text-ink-muted mt-2">{dict.archive.subtitle}</p>
      </div>

      <SectionDivider />

      <WatchGrid watches={sold} locale={locale} emptyText={dict.archive.empty} />
    </div>
  );
}
