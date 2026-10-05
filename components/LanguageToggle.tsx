"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { IS_STATIC_EXPORT } from "@/lib/constants";
import { LOCALES, type Locale } from "@/lib/i18n/locale";

// Prepínač jazyka CZ / SK / EN — aktívny jazyk je zvýraznený.
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale, dict } = useLocale();
  const router = useRouter();

  function choose(next: Locale) {
    if (next === locale) return;
    setLocale(next);
    // Server prerenderuje stránku v novom jazyku; statický export má všetky verzie už v prehliadači.
    if (!IS_STATIC_EXPORT) router.refresh();
  }

  return (
    <span
      role="group"
      aria-label={dict.lang.toggleLabel}
      className={["flex items-center gap-1.5 font-mono text-11 uppercase tracking-[0.06em]", className].join(" ")}
    >
      {LOCALES.map((code, i) => (
        <span key={code} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-line">·</span>}
          <button
            type="button"
            onClick={() => choose(code)}
            aria-pressed={code === locale}
            className={code === locale ? "text-ink" : "text-ink-muted hover:text-ink transition-opacity duration-150"}
          >
            {dict.lang[code]}
          </button>
        </span>
      ))}
    </span>
  );
}
