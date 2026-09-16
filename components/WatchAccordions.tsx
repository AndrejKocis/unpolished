import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";

export function WatchAccordions({ locale }: { locale: Locale }) {
  const items = dictionaries[locale].watchDetail.accordions;

  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details key={item.title} className="group border-b border-line">
          <summary className="flex items-center justify-between py-4 cursor-pointer text-15 list-none [&::-webkit-details-marker]:hidden">
            {item.title}
            <span className="font-mono text-15 group-open:hidden">+</span>
            <span className="font-mono text-15 hidden group-open:inline">−</span>
          </summary>
          <p className="text-15 text-ink-muted pb-4 pr-8">{item.body}</p>
        </details>
      ))}
    </div>
  );
}
