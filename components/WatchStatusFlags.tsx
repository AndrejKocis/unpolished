import type { Watch } from "@/lib/schema";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";

function IconServiced({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path
        d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPolished({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" strokeLinecap="round" />
      <path d="M20 4v5h-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconKeepsTime({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMissingPart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M12 3 2 20h20L12 3Z" strokeLinejoin="round" />
      <path d="M12 9v5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WatchStatusFlags({ watch, locale }: { watch: Watch; locale: Locale }) {
  const dict = dictionaries[locale];

  const items = [
    { key: "serviced", Icon: IconServiced, enabled: watch.serviced, label: dict.watchDetail.statusFlags.serviced },
    { key: "polished", Icon: IconPolished, enabled: watch.polished, label: dict.watchDetail.statusFlags.polished },
    { key: "keepsTime", Icon: IconKeepsTime, enabled: watch.keepsTime, label: dict.watchDetail.statusFlags.keepsTime },
    {
      key: "missingParts",
      Icon: IconMissingPart,
      enabled: watch.missingParts,
      label: dict.watchDetail.statusFlags.missingParts,
    },
  ];

  return (
    <section>
      <h2 className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted mb-4">
        {dict.watchDetail.statusFlagsTitle}
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-0 sm:divide-x sm:divide-line">
        {items.map(({ key, Icon, enabled, label }) => (
          <div
            key={key}
            className={[
              "flex flex-col items-start gap-2 sm:flex-1 sm:px-4 sm:first:pl-0",
              enabled ? "text-ink" : "text-line",
            ].join(" ")}
            aria-label={`${label}: ${enabled ? "áno" : "nie"}`}
          >
            <Icon className="h-5 w-5" />
            <span
              className={[
                "font-mono text-11 uppercase tracking-[0.06em]",
                enabled ? "text-ink" : "text-ink-muted",
              ].join(" ")}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
