"use client";

import { useRef } from "react";
import { decadeLabel } from "@/lib/filters";
import { useLocale } from "@/components/LocaleProvider";

type Props = {
  brands: string[];
  decades: string[];
  current: {
    brand?: string;
    decade?: string;
    price?: string;
    sort?: string;
    sold?: boolean;
  };
};

const selectClass =
  "bg-transparent border-0 border-b border-ink text-11 uppercase tracking-[0.06em] font-mono py-2 pr-6 focus-visible:outline-none";

export function WatchFilters({ brands, decades, current }: Props) {
  const { dict } = useLocale();
  const formRef = useRef<HTMLFormElement>(null);

  function submitOnChange() {
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} method="get" action="/watches" className="flex flex-wrap items-end gap-x-6 gap-y-4">
      <label className="flex flex-col gap-1">
        <span className="text-11 uppercase tracking-[0.06em] text-ink-muted font-mono">
          {dict.watches.brand}
        </span>
        <select name="brand" defaultValue={current.brand ?? ""} onChange={submitOnChange} className={selectClass}>
          <option value="">{dict.watches.all}</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-11 uppercase tracking-[0.06em] text-ink-muted font-mono">
          {dict.watches.decade}
        </span>
        <select name="decade" defaultValue={current.decade ?? ""} onChange={submitOnChange} className={selectClass}>
          <option value="">{dict.watches.all}</option>
          {decades.map((d) => (
            <option key={d} value={d}>
              {decadeLabel(d)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-11 uppercase tracking-[0.06em] text-ink-muted font-mono">
          {dict.watches.price}
        </span>
        <select name="price" defaultValue={current.price ?? ""} onChange={submitOnChange} className={selectClass}>
          <option value="">{dict.watches.all}</option>
          {dict.watches.priceBands.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-11 uppercase tracking-[0.06em] text-ink-muted font-mono">
          {dict.watches.sort}
        </span>
        <select name="sort" defaultValue={current.sort ?? "newest"} onChange={submitOnChange} className={selectClass}>
          <option value="newest">{dict.watches.newest}</option>
          <option value="price-asc">{dict.watches.priceAsc}</option>
          <option value="price-desc">{dict.watches.priceDesc}</option>
        </select>
      </label>

      <label className="flex items-center gap-2 pb-2">
        <input
          type="checkbox"
          name="sold"
          value="1"
          defaultChecked={current.sold}
          onChange={submitOnChange}
          className="h-4 w-4 accent-ink"
        />
        <span className="text-11 uppercase tracking-[0.06em] text-ink-muted font-mono">
          {dict.watches.showSold}
        </span>
      </label>

      <noscript>
        <button type="submit" className="text-15 underline underline-offset-[3px] pb-2">
          {dict.watches.filter}
        </button>
      </noscript>
    </form>
  );
}
