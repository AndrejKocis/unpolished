export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={["relative inline-flex items-stretch gap-1 h-[23px] sm:h-[26px]", className].join(" ")}>
      {/* Endlink — koncový článok remienka, presne na výšku čierneho rámčeka */}
      <svg
        viewBox="0 0 10 20"
        className="h-full w-auto text-ink shrink-0"
        aria-hidden="true"
      >
        <path d="M1 0 L9 0 L9 20 L1 20 Q6 10 1 0 Z" fill="currentColor" />
      </svg>
      <span className="bg-ink px-3 py-1 !rounded-r-md flex items-center">
        <span className="block font-serif uppercase tracking-[-0.02em] leading-none font-bold text-white [-webkit-text-stroke:0.5px_currentColor]">
          unpolished
        </span>
      </span>
    </span>
  );
}
