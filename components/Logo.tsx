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
          d="M22 0 C8 50, 0 90, 0 125 C0 160, 10 200, 24 220 L100 220 L100 0 Z"
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
