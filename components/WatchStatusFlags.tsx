import type { Watch } from "@/lib/schema";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";
import { StatusFlag } from "@/components/StatusFlag";

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

function IconFullSet({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="9" width="18" height="11" strokeLinejoin="round" />
      <path d="M3 9 12 4l9 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 20v-5h6v5" strokeLinejoin="round" />
    </svg>
  );
}

function IconOnlyBox({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="9" width="18" height="11" strokeLinejoin="round" />
      <path d="M3 9 12 4l9 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconOriginalBracelet({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="5" />
      <path d="M2 9h4M2 15h4M18 9h4M18 15h4" strokeLinecap="round" />
    </svg>
  );
}

function IconOriginalStrap({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="7" y="9" width="10" height="6" rx="1" />
      <path d="M9 9V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5M9 15v5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-5" strokeLinecap="round" strokeLinejoin="round" />
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
    { key: "fullSet", Icon: IconFullSet, enabled: watch.fullSet, label: dict.watchDetail.statusFlags.fullSet },
    { key: "onlyBox", Icon: IconOnlyBox, enabled: watch.onlyBox, label: dict.watchDetail.statusFlags.onlyBox },
    {
      key: "originalBracelet",
      Icon: IconOriginalBracelet,
      enabled: watch.originalBracelet,
      label: dict.watchDetail.statusFlags.originalBracelet,
    },
    {
      key: "originalStrap",
      Icon: IconOriginalStrap,
      enabled: watch.originalStrap,
      label: dict.watchDetail.statusFlags.originalStrap,
    },
  ];

  const { statusYes, statusNo } = dict.watchDetail;

  return (
    <section>
      <h2 className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted mb-4">
        {dict.watchDetail.statusFlagsTitle}
      </h2>
      <div className="flex items-center justify-between max-w-md">
        {items.map(({ key, Icon, enabled, label }, i) => (
          <StatusFlag
            key={key}
            icon={<Icon className="h-6 w-6" />}
            text={`${label}: ${enabled ? statusYes : statusNo}`}
            enabled={enabled}
            align={i === 0 ? "start" : i === items.length - 1 ? "end" : "center"}
          />
        ))}
      </div>
    </section>
  );
}
