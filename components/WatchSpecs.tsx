import type { Watch } from "@/lib/schema";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";

export function WatchSpecs({ watch, locale }: { watch: Watch; locale: Locale }) {
  const { specLabels: labels, specsShowMore, specsShowLess } = dictionaries[locale].watchDetail;

  const rows: [string, string][] = [
    ...(watch.reference ? [[labels.reference, watch.reference] as [string, string]] : []),
    [labels.year, String(watch.year)],
    [labels.caliber, watch.caliber],
    [labels.caseSize, `${watch.caseSize} mm`],
    [labels.caseMaterial, watch.caseMaterial],
    [labels.dial, watch.dial],
    [labels.casePolish, watch.casePolish],
    [labels.set, watch.set],
    [labels.service, watch.service],
    [labels.warranty, watch.warranty],
  ];

  // Hneď viditeľné sú len kľúčové údaje (referencia, rok, kaliber), zvyšok je v rozbaľovacej časti.
  const primaryCount = watch.reference ? 3 : 2;
  const primary = rows.slice(0, primaryCount);
  const more = rows.slice(primaryCount);

  return (
    <div className="border-t border-line">
      <SpecRows rows={primary} />
      <details className="group">
        <summary className="flex items-center justify-between py-3 border-b border-line cursor-pointer list-none [&::-webkit-details-marker]:hidden font-mono text-11 uppercase tracking-[0.06em] text-ink-muted hover:text-ink">
          <span className="group-open:hidden">{specsShowMore}</span>
          <span className="hidden group-open:inline">{specsShowLess}</span>
          <span className="text-15 group-open:hidden">+</span>
          <span className="text-15 hidden group-open:inline">−</span>
        </summary>
        <SpecRows rows={more} />
      </details>
    </div>
  );
}

function SpecRows({ rows }: { rows: [string, string][] }) {
  return (
    <dl>
      {rows.map(([label, value]) => (
        <div key={label} className="flex gap-6 py-3 border-b border-line">
          <dt className="w-2/5 sm:w-1/3 font-mono text-11 uppercase tracking-[0.06em] text-ink-muted">
            {label}
          </dt>
          <dd className="w-3/5 sm:w-2/3 text-15">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
