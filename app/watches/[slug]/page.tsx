import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllWatches, getRelatedWatches, getWatchBySlug } from "@/lib/watches";
import { formatPrice, statusBadgeLabel } from "@/lib/format";
import { imageAspect } from "@/lib/gallery";
import { Gallery } from "@/components/Gallery";
import { WatchCTA } from "@/components/WatchCTA";
import { WatchSpecs } from "@/components/WatchSpecs";
import { WatchAccordions } from "@/components/WatchAccordions";
import { Prose } from "@/components/Prose";
import { WatchGrid } from "@/components/WatchGrid";
import { SectionDivider } from "@/components/SectionDivider";
import { SITE_URL } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";

export async function generateStaticParams() {
  return getAllWatches().map((w) => ({ slug: w.slug }));
}

function buildTitle(watch: NonNullable<ReturnType<typeof getWatchBySlug>>): string {
  const dialAttr = watch.dial.split(",")[0].toLowerCase();
  const isFullSet = watch.set !== "Iba hodinky";
  return `${watch.brand} ${watch.model} Ref. ${watch.reference} — ${dialAttr} ciferník — ${watch.caseMaterial.toLowerCase()} — ${
    isFullSet ? "Unpolished Full Set" : "Unpolished"
  }`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const watch = getWatchBySlug(slug);
  if (!watch) return {};

  const title = buildTitle(watch);
  const description = `${watch.brand} ${watch.model} ref. ${watch.reference} z roku ${watch.year}. ${watch.dial}. Nepolírované puzdro, ostré hrany, plné lugy.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/watches/${watch.reference}/${watch.images[0]}`],
    },
  };
}

export default async function WatchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const watch = getWatchBySlug(slug);
  if (!watch) notFound();

  const locale = await getLocale();
  const dict = dictionaries[locale];

  const images = watch.images.map((img) => ({
    src: `/watches/${watch.reference}/${img}`,
    alt: `${watch.brand} ${watch.model} ref. ${watch.reference} — ${img
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/^\d+-/, "")
      .replaceAll("-", " ")}`,
    aspect: imageAspect(img),
  }));

  const related = getRelatedWatches(watch);
  const title = buildTitle(watch);

  const availability =
    watch.status === "available"
      ? "https://schema.org/InStock"
      : watch.status === "reserved"
        ? "https://schema.org/LimitedAvailability"
        : "https://schema.org/SoldOut";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${watch.brand} ${watch.model} ${watch.reference}`,
    sku: watch.reference,
    brand: { "@type": "Brand", name: watch.brand },
    description: `${watch.brand} ${watch.model} ref. ${watch.reference} z roku ${watch.year}. Nepolírované puzdro.`,
    image: images.map((img) => `${SITE_URL}${img.src}`),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/watches/${watch.slug}`,
      priceCurrency: watch.currency,
      price: watch.price,
      availability,
      itemCondition: "https://schema.org/UsedCondition",
    },
  };

  return (
    <div className="pb-20 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Galéria + 2/3/4 titulok, cena, CTA + 5/6/7 špecifikácie, popis, accordiony */}
      <div className="lg:flex lg:items-start">
        <div className="lg:w-3/5">
          <Gallery images={images} />
        </div>

        <div className="lg:w-2/5 lg:sticky lg:top-14 lg:max-h-[calc(100vh-56px)] lg:overflow-y-auto px-4 sm:px-6 py-8 lg:py-12 flex flex-col gap-8">
          <h1 className="font-serif text-24 lg:text-32 leading-tight">{title}</h1>

          <div>
            {watch.status === "available" ? (
              <p className="font-mono text-24">{formatPrice(watch.price, watch.currency, locale)}</p>
            ) : (
              <p className="font-mono text-24 text-sold">{statusBadgeLabel(watch.status, dict)}</p>
            )}
            <p className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted mt-1">
              {dict.watchDetail.oneOfOne}
            </p>
          </div>

          <WatchCTA watch={watch} />

          <SectionDivider />

          {/* 5. Špecifikácie */}
          <section>
            <h2 className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted mb-4">
              {dict.watchDetail.specifications}
            </h2>
            <WatchSpecs watch={watch} locale={locale} />
          </section>

          {/* 6. Popis */}
          <section>
            <Prose content={watch.content} />
          </section>

          {/* 7. Accordiony */}
          <section>
            <WatchAccordions locale={locale} />
          </section>
        </div>
      </div>

      {/* 8. Podobné kusy */}
      {related.length > 0 && (
        <>
          <SectionDivider />
          <section id="podobne-kusy" className="py-12 lg:py-16">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-6">
              <h2 className="font-serif text-24">{dict.watchDetail.similarWatches}</h2>
            </div>
            <WatchGrid watches={related} locale={locale} />
          </section>
        </>
      )}

      <WatchCTA watch={watch} sticky />
    </div>
  );
}
