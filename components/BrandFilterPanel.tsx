"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";

export function BrandFilterPanel({ brands }: { brands: string[] }) {
  const { dict } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const selected = (searchParams.get("brand") ?? "").split(",").filter(Boolean);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function navigate(nextSelected: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextSelected.length > 0) {
      params.set("brand", nextSelected.join(","));
    } else {
      params.delete("brand");
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function toggleBrand(brand: string) {
    const next = selected.includes(brand)
      ? selected.filter((b) => b !== brand)
      : [...selected, brand];
    navigate(next);
  }

  function reset() {
    navigate([]);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 font-mono text-11 uppercase tracking-[0.06em] text-ink border-b border-ink pb-1"
      >
        {dict.watches.showFilters}
        {selected.length > 0 && <span className="text-ink-muted">({selected.length})</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label={dict.common.close}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />

          <div className="absolute inset-y-0 left-0 w-[85vw] max-w-[360px] bg-white border-r border-line flex flex-col">
            <div className="flex items-center justify-between px-5 py-5 border-b border-line">
              <h2 className="font-mono text-11 uppercase tracking-[0.06em] text-ink">
                {dict.watches.brand}
                {selected.length > 0 && <span className="text-ink-muted"> ({selected.length})</span>}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={dict.common.close}
                className="font-mono text-18 leading-none text-ink-muted hover:text-ink"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="flex flex-col gap-4">
                {brands.map((b) => {
                  const checked = selected.includes(b);
                  return (
                    <label key={b} className="flex items-center gap-3 cursor-pointer select-none">
                      <span
                        className={[
                          "flex h-4 w-4 items-center justify-center border shrink-0",
                          checked ? "bg-ink border-ink" : "border-line",
                        ].join(" ")}
                        aria-hidden="true"
                      >
                        {checked && <span className="h-2 w-2 bg-white" />}
                      </span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleBrand(b)}
                        className="sr-only"
                      />
                      <span className="font-mono text-11 uppercase tracking-[0.06em] text-ink">{b}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 px-5 py-5 border-t border-line">
              <button
                type="button"
                onClick={reset}
                disabled={selected.length === 0}
                className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted underline underline-offset-[3px] hover:text-ink disabled:opacity-40 disabled:no-underline"
              >
                {dict.watches.reset}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="font-mono text-11 uppercase tracking-[0.06em] bg-ink text-white px-4 py-2"
              >
                {dict.watches.hideFilters}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
