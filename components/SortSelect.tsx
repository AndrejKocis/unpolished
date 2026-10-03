"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";

export function SortSelect({ searchParams }: { searchParams: URLSearchParams }) {
  const { dict } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const current = searchParams.get("sort") ?? "";

  const options = [
    { value: "", label: dict.watches.newest },
    { value: "oldest", label: dict.watches.oldest },
    { value: "price-desc", label: dict.watches.priceDesc },
    { value: "price-asc", label: dict.watches.priceAsc },
  ];

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <label className="relative flex items-center gap-2 font-mono text-11 uppercase tracking-[0.06em] text-ink-muted">
      <span>{dict.watches.sort}</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent text-ink border-b border-ink pb-1 pr-4 font-mono text-11 uppercase tracking-[0.06em] cursor-pointer focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 10 6"
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-[70%] h-[6px] w-[10px] text-ink"
        aria-hidden="true"
      >
        <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </label>
  );
}
