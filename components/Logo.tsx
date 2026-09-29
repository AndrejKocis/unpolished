export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={["relative inline-flex items-stretch -space-x-px h-[23px] sm:h-[26px]", className].join(" ")}>
      {/* Endlink — koncový článok remienka, presne na výšku čierneho rámčeka, priamo nalepený na badge */}
      <svg
        viewBox="0 0 100 140"
        className="h-full w-auto text-ink shrink-0"
        aria-hidden="true"
      >
        <path
          d="M95 20
             L42 36
             C2 48, 0 58, 0 70
             C0 82, 2 92, 42 104
             L95 120
             L44 100
             C28 90, 26 80, 26 70
             C26 60, 28 50, 44 40
             Z"
          fill="currentColor"
        />
      </svg>
      <span className="bg-ink px-3 py-1 !rounded-r-md flex items-center">
        <span className="block font-serif uppercase tracking-[-0.02em] leading-none font-bold text-white [-webkit-text-stroke:0.5px_currentColor]">
          unpolished
        </span>
      </span>
    </span>
  );
}
