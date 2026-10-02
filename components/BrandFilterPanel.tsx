"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";

export function BrandFilterPanel({ brands }: { brands: string[] }) {
  const { dict } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const selected = (searchParams.get("brand") ?? "").split(",").filter(Boolean);

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
    <div className="w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 font-mono text-11 uppercase tracking-[0.06em] text-ink border-b border-ink pb-1"
      >
        {open ? dict.watches.hideFilters : dict.watches.showFilters}
        {selected.length > 0 && <span className="text-ink-muted">({selected.length})</span>}
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted mr-1">
              {dict.watches.brand}
            </span>
            {selected.map((b) => (
              <span
                key={b}
                className="font-mono text-11 uppercase tracking-[0.06em] bg-ink text-white border border-ink px-2 py-1"
              >
                {b}
              </span>
            ))}
            {selected.length > 0 && (
              <button
                type="button"
                onClick={reset}
                className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted underline underline-offset-[3px] hover:text-ink"
              >
                {dict.watches.reset}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-6 gap-y-2">
            {brands.map((b) => {
              const checked = selected.includes(b);
              return (
                <label key={b} className="flex items-center gap-2 cursor-pointer select-none">
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
      )}
    </div>
  );
}
