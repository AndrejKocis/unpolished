"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";

export function FilterPanel({ brands }: { brands: string[] }) {
  const { dict } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const list = (key: string) => (searchParams.get(key) ?? "").split(",").filter(Boolean);
  const selectedBrands = list("brand");
  const activeCount = selectedBrands.length;

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

  function navigate(updates: Record<string, string[]>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, values] of Object.entries(updates)) {
      if (values.length > 0) {
        params.set(key, values.join(","));
      } else {
        params.delete(key);
      }
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const toggle = (values: string[], value: string) =>
    values.includes(value) ? values.filter((v) => v !== value) : [...values, value];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 font-mono text-11 uppercase tracking-[0.06em] text-ink border-b border-ink pb-1"
      >
        {dict.watches.showFilters}
        {activeCount > 0 && <span className="text-ink-muted">({activeCount})</span>}
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
                {dict.watches.filter}
                {activeCount > 0 && <span className="text-ink-muted"> ({activeCount})</span>}
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

            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-8">
              <FilterGroup
                title={dict.watches.brand}
                options={brands.map((b) => ({ value: b, label: b }))}
                selected={selectedBrands}
                onToggle={(v) => navigate({ brand: toggle(selectedBrands, v) })}
              />
            </div>

            <div className="flex items-center justify-between gap-4 px-5 py-5 border-t border-line">
              <button
                type="button"
                onClick={() => navigate({ brand: [] })}
                disabled={activeCount === 0}
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

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: readonly { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted mb-4">{title}</legend>
      {options.map((o) => {
        const checked = selected.includes(o.value);
        return (
          <label key={o.value} className="flex items-center gap-3 cursor-pointer select-none">
            <span
              className={[
                "flex h-4 w-4 items-center justify-center border shrink-0",
                checked ? "bg-ink border-ink" : "border-line",
              ].join(" ")}
              aria-hidden="true"
            >
              {checked && <span className="h-2 w-2 bg-white" />}
            </span>
            <input type="checkbox" checked={checked} onChange={() => onToggle(o.value)} className="sr-only" />
            <span className="font-mono text-11 uppercase tracking-[0.06em] text-ink">{o.label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
