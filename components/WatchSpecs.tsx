import type { Watch } from "@/lib/schema";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";

export function WatchSpecs({ watch, locale }: { watch: Watch; locale: Locale }) {
  const labels = dictionaries[locale].watchDetail.specLabels;

  const rows: [string, string][] = [
    [labels.reference, watch.reference],
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

  return (
    <dl className="border-t border-line">
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
