export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={["relative inline-flex items-stretch gap-[2px] h-[23px] sm:h-[26px]", className].join(" ")}>
      {/* Logo ikona — obdĺžnik s jedným plynulým vydutím doľava */}
      <svg
        viewBox="0 0 100 220"
        className="h-full w-auto text-ink shrink-0"
        aria-hidden="true"
      >
        <path
          d="M42 0 C15 35, 0 75, 0 110 C0 145, 15 185, 42 220 L100 220 L100 0 Z"
          fill="currentColor"
        />
      </svg>
      <span className="logo-badge bg-ink px-2 py-1 !rounded-r-md flex items-center">
        <span className="logo-badge-text block font-serif uppercase tracking-[-0.02em] leading-none font-bold text-white [-webkit-text-stroke:0.5px_currentColor]">
          unpolished
        </span>
      </span>
    </span>
  );
}
