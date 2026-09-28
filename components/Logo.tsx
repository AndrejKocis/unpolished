export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={["relative inline-flex items-center", className].join(" ")}>
      {/* Endlink — koncový článok remienka, dekoratívny prvok naľavo od nápisu */}
      <svg
        viewBox="0 0 10 20"
        className="h-[1.4em] w-auto text-ink shrink-0 -mr-px"
        aria-hidden="true"
      >
        <path d="M1 0 L9 0 L6 10 L9 20 L1 20 L4 10 Z" fill="currentColor" />
      </svg>
      <span className="bg-ink px-3 py-1 !rounded-r-md">
        <span className="block font-serif uppercase tracking-[-0.02em] leading-none font-bold text-white [-webkit-text-stroke:0.5px_currentColor]">
          unpolished
        </span>
      </span>
    </span>
  );
}
