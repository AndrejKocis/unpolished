import type { Watch } from "@/lib/schema";
import { WatchCard } from "@/components/WatchCard";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";

export function WatchGrid({
  watches,
  locale,
  priorityCount = 0,
}: {
  watches: Watch[];
  locale: Locale;
  priorityCount?: number;
}) {
  const dict = dictionaries[locale];

  if (watches.length === 0) {
    return (
      <p className="text-15 text-ink-muted py-16 text-center">{dict.watchGrid.empty}</p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 max-w-[1280px] mx-auto px-4 sm:px-6">
      {watches.map((watch, i) => (
        <WatchCard
          key={watch.slug}
          watch={watch}
          locale={locale}
          priority={i < priorityCount}
        />
      ))}
    </div>
  );
}
