"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { IS_STATIC_EXPORT } from "@/lib/constants";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale, dict } = useLocale();
  const router = useRouter();

  function toggle() {
    setLocale(locale === "sk" ? "en" : "sk");
    // Server prerenderuje stránku v novom jazyku; statický export má obe verzie už v prehliadači.
    if (!IS_STATIC_EXPORT) router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dict.lang.toggleLabel}
      className={[
        "font-mono text-11 uppercase tracking-[0.06em] text-ink-muted hover:text-ink transition-opacity duration-150",
        className,
      ].join(" ")}
    >
      {locale === "sk" ? dict.lang.en : dict.lang.sk}
    </button>
  );
}
