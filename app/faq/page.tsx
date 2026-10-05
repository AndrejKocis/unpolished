import type { Metadata } from "next";
import { SectionDivider } from "@/components/SectionDivider";
import { getLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";
import { Localized } from "@/components/Localized";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = dictionaries[locale];
  return {
    title: dict.faq.title,
    description: dict.faq.metaDescription,
  };
}

export default function FaqPage() {
  return <Localized>{(locale) => <FaqPageContent locale={locale} />}</Localized>;
}

function FaqPageContent({ locale }: { locale: Locale }) {
  const dict = dictionaries[locale];

  return (
    <div>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="font-serif text-24 sm:text-32">{dict.faq.title}</h1>
      </div>

      <SectionDivider />

      <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-12">
        {dict.faq.items.map((item) => (
          <details key={item.q} className="group border-b border-line">
            <summary className="flex items-center justify-between py-4 cursor-pointer text-15 list-none [&::-webkit-details-marker]:hidden">
              {item.q}
              <span className="font-mono text-15 group-open:hidden">+</span>
              <span className="font-mono text-15 hidden group-open:inline">−</span>
            </summary>
            <p className="text-15 text-ink-muted pb-4 pr-8">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
