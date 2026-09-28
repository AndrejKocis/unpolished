export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={["relative inline-flex items-center", className].join(" ")}>
      {/* Korunka hodiniek — dekoratívny prvok naľavo od nápisu, "pripojený" k puzdru (čiernemu pozadiu) */}
      <svg
        viewBox="0 0 16 20"
        className="h-[0.75em] w-auto text-ink shrink-0"
        aria-hidden="true"
      >
        <rect x="9" y="8" width="7" height="4" fill="currentColor" />
        <rect x="1" y="4" width="9" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="3.5" y1="4" x2="3.5" y2="16" stroke="currentColor" strokeWidth="1" />
        <line x1="6" y1="4" x2="6" y2="16" stroke="currentColor" strokeWidth="1" />
        <line x1="8.5" y1="4" x2="8.5" y2="16" stroke="currentColor" strokeWidth="1" />
      </svg>
      <span className="bg-ink px-3 py-1 !rounded-r-md">
        <span className="block font-serif uppercase tracking-[-0.02em] leading-none font-bold text-white [-webkit-text-stroke:0.5px_currentColor]">
          unpolished
        </span>
      </span>
    </span>
  );
}
