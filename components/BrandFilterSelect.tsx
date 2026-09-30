"use client";

import { useRef } from "react";

export function BrandFilterSelect({
  brands,
  current,
  hidden,
  label,
  allLabel,
}: {
  brands: string[];
  current?: string;
  hidden: Record<string, string | undefined>;
  label: string;
  allLabel: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} method="get" action="/watches" className="flex items-center gap-2">
      {Object.entries(hidden).map(
        ([key, value]) => value && <input key={key} type="hidden" name={key} value={value} />
      )}
      <label className="flex items-center gap-2">
        <span className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted">{label}</span>
        <select
          name="brand"
          defaultValue={current ?? ""}
          onChange={() => formRef.current?.requestSubmit()}
          className="bg-transparent border-0 border-b border-ink text-11 uppercase tracking-[0.06em] font-mono py-1 pr-5 focus-visible:outline-none"
        >
          <option value="">{allLabel}</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>
      <noscript>
        <button type="submit" className="text-13 underline underline-offset-[3px]">
          {label}
        </button>
      </noscript>
    </form>
  );
}
