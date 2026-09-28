export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={["relative inline-flex items-center", className].join(" ")}>
      {/* Stežejka (pružinová tyčka) — dekoratívny prvok naľavo od nápisu */}
      <svg
        viewBox="0 0 10 22"
        className="h-[0.85em] w-auto text-ink shrink-0"
        aria-hidden="true"
      >
        <line x1="5" y1="3" x2="5" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="5" cy="3" r="2" fill="currentColor" />
        <circle cx="5" cy="19" r="2" fill="currentColor" />
      </svg>
      <span className="bg-ink px-3 py-1 !rounded-r-md">
        <span className="block font-serif uppercase tracking-[-0.02em] leading-none font-bold text-white [-webkit-text-stroke:0.5px_currentColor]">
          unpolished
        </span>
      </span>
    </span>
  );
}
