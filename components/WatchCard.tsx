import Image from "next/image";
import Link from "next/link";
import type { Watch } from "@/lib/schema";
import { dialLabel, formatPrice, statusBadgeLabel, watchLabel } from "@/lib/format";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";
import { CardVideo } from "@/components/CardVideo";

export function WatchCard({
  watch,
  locale,
  priority = false,
}: {
  watch: Watch;
  locale: Locale;
  priority?: boolean;
}) {
  const dict = dictionaries[locale];
  const badge = statusBadgeLabel(watch.status, dict);
  const sold = watch.status === "sold";

  return (
    <Link
      href={`/watches/${watch.slug}`}
      className="group block bg-white hover:border-ink border border-transparent transition-[border-color] duration-150"
    >
      <div className="relative aspect-[4/5] bg-paper overflow-hidden">
        {watch.video ? (
          <CardVideo
            src={`/watches/${watch.media}/${watch.video}`}
            ariaLabel={watchLabel(watch)}
            posterSrc={watch.videoPoster ? `/watches/${watch.media}/${watch.videoPoster}` : undefined}
          />
        ) : (
          <Image
            src={`/watches/${watch.media}/${watch.images[0]}`}
            alt={watchLabel(watch)}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
            priority={priority}
          />
        )}
      </div>
      <div className="p-4">
        <p className="font-serif text-15">
          {watch.brand} {watch.model}
        </p>
        <p className="text-13 text-ink-muted mt-1">
          {watch.year} · {dialLabel(watch, locale)}
        </p>
        <p
          className={[
            "font-mono text-13 mt-2",
            sold ? "line-through text-sold" : "text-ink",
          ].join(" ")}
        >
          {formatPrice(watch.price, watch.currency, locale)}
        </p>
        {badge && (
          <p className="font-mono text-11 uppercase tracking-[0.06em] text-sold mt-1">
            {badge}
          </p>
        )}
      </div>
    </Link>
  );
}
