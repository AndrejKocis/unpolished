import Image from "next/image";
import Link from "next/link";
import { getAvailableWatches, getWatchBySlug } from "@/lib/watches";
import { Button } from "@/components/ui/Button";
import { SectionDivider } from "@/components/SectionDivider";
import { WatchGrid } from "@/components/WatchGrid";
import { ViewAllWatchesCard } from "@/components/ViewAllWatchesCard";
import { HeroVideo } from "@/components/HeroVideo";
import { NewsletterForm } from "@/components/NewsletterForm";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Watch } from "@/lib/schema";
import type { Locale } from "@/lib/i18n/locale";
import { Localized } from "@/components/Localized";

// Zvýš pri každom novom renderi hero média, aby prehliadače nenačítali starú verziu z cache.
const HERO_MEDIA = "/hero/watch";
const HERO_VERSION = "v4";
const heroSrc = (theme: "light" | "dark", ext: "webp" | "mp4" | "png" | "shadow.png") => `${HERO_MEDIA}-${theme}.${HERO_VERSION}.${ext}`;

export default function Home() {
  const available = getAvailableWatches().slice(0, 6);
  const heroWatch = getWatchBySlug("longines-ultra-chron-night-sky-unpolished");
  const lugsMacro = heroWatch ? `/watches/${heroWatch.media}/hero-wide.jpg` : undefined;

  return (
    <Localized>
      {(locale) => <HomeContent locale={locale} available={available} lugsMacro={lugsMacro} />}
    </Localized>
  );
}

function HomeContent({
  locale,
  available,
  lugsMacro,
}: {
  locale: Locale;
  available: Watch[];
  lugsMacro: string | undefined;
}) {
  const dict = dictionaries[locale];

  return (
    <div>
      {/* Hero */}
      <section>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="flex flex-col items-start gap-4 text-left order-2 lg:order-1">
            <h1 className="font-serif text-32 lg:text-48 leading-tight">
              {dict.home.heroTitle}
            </h1>
            <p className="text-15">{dict.home.heroSubtitle}</p>
            <Button href="/watches" fullWidthOnMobile className="mt-2">
              {dict.home.heroCta}
            </Button>
          </div>
          <div className="hero-reveal relative aspect-square order-1 lg:order-2">
          {/* Tmavá fotka má tieň len o pár úrovní pod pozadím a video ho rozbije na schodíky,
              preto je v tmavom režime tieň samostatná hladká vrstva pod maskovanými hodinkami. */}
          <div
            aria-hidden="true"
            className="theme-img-dark absolute inset-0 bg-no-repeat bg-[length:100%_100%]"
            style={{ backgroundImage: `url(${heroSrc("dark", "shadow.png")})` }}
          />
          <div
            className="hero-masked absolute inset-0"
            style={
              {
                "--hero-mask-light": `url(${heroSrc("light", "png")})`,
                "--hero-mask-dark": `url(${heroSrc("dark", "png")})`,
              } as React.CSSProperties
            }
          >
            <Image
              src={heroSrc("light", "webp")}
              alt={dict.home.heroAlt}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="theme-img-light object-cover"
            />
            <Image
              src={heroSrc("dark", "webp")}
              alt={dict.home.heroAlt}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="theme-img-dark object-cover"
            />
            {/* Video so sekundovou ručičkou — prvá snímka je zhodná s fotkou pod ním */}
            <div className="absolute inset-0 motion-reduce:hidden">
              <HeroVideo
                src={heroSrc("light", "mp4")}
                className="theme-img-light absolute inset-0 h-full w-full object-cover"
              />
              <HeroVideo
                src={heroSrc("dark", "mp4")}
                className="theme-img-dark absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
          </div>
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

      {/* Prečo neleštené */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="relative aspect-square bg-paper">
            {lugsMacro && (
              <Image
                src={lugsMacro}
                alt={dict.home.lugsAlt}
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
