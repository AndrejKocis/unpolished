import Image from "next/image";
import Link from "next/link";
import { getAvailableWatches, getWatchBySlug } from "@/lib/watches";
import { Button } from "@/components/ui/Button";
import { SectionDivider } from "@/components/SectionDivider";
import { WatchGrid } from "@/components/WatchGrid";
import { ViewAllWatchesCard } from "@/components/ViewAllWatchesCard";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";

export default async function Home() {
  const locale = await getLocale();
  const dict = dictionaries[locale];

  const available = getAvailableWatches().slice(0, 6);
  const heroWatch = getWatchBySlug("longines-ultra-chron-night-sky-unpolished");
  const lugsMacro = heroWatch ? `/watches/${heroWatch.reference}/hero-wide.jpg` : undefined;

  return (
    <div>
      {/* Hero (bez fotky — priamo text a CTA) */}
      <section>
        <div className="px-4 sm:px-6 py-8 sm:py-12 max-w-[640px] mx-auto text-center flex flex-col items-center gap-4">
          <h1 className="font-serif text-32 lg:text-48 leading-tight">
            {dict.home.heroTitle}
          </h1>
          <p className="text-15">{dict.home.heroSubtitle}</p>
          <Button href="/watches" fullWidthOnMobile className="mt-2">
            {dict.home.heroCta}
          </Button>
        </div>
      </section>

      <SectionDivider />

      {/* Aktuálne kusy */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-8">
          <h2 className="font-serif text-24">{dict.home.currentTitle}</h2>
          <p className="text-15 text-ink-muted mt-2">{dict.home.currentSubtitle}</p>
        </div>
        <WatchGrid
          watches={available}
          locale={locale}
          priorityCount={3}
          trailing={<ViewAllWatchesCard label={dict.home.allWatches} />}
        />
      </section>

      <SectionDivider />

      {/* Prečo nepolírované */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="relative aspect-square bg-paper">
            {lugsMacro && (
              <Image
                src={lugsMacro}
                alt="Watch lugs macro"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            )}
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="font-serif text-24">{dict.home.whyTitle}</h2>
            <p className="text-15">{dict.home.whyText}</p>
            <Link href="/about" className="text-15 underline underline-offset-[3px]">
              {dict.home.whyLink}
            </Link>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Proces overenia */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8">
          {dict.home.processSteps.map((step) => (
            <div key={step.number} className="flex flex-col gap-3">
              <p className="font-mono text-11 text-ink-muted">{step.number}</p>
              <h3 className="font-serif text-18">{step.title}</h3>
              <p className="text-15 text-ink-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* Newsletter */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col gap-6">
          <div>
            <h2 className="font-serif text-24">{dict.home.newsletterTitle}</h2>
            <p className="text-15 text-ink-muted mt-2">{dict.home.newsletterSubtitle}</p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
