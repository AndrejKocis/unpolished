export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={["relative inline-flex items-center", className].join(" ")}>
      {/* Stežejka (pružinová tyčka) — dekoratívny prvok naľavo od nápisu, s presahom nad a pod badge */}
      <svg
        viewBox="0 0 4 20"
        className="h-[1.4em] w-auto text-ink shrink-0 -mr-px"
        aria-hidden="true"
      >
        <path d="M2 0 L2.8 2.5 L2.8 17.5 L2 20 L1.2 17.5 L1.2 2.5 Z" fill="currentColor" />
      </svg>
      <span className="bg-ink px-3 py-1 !rounded-r-md">
        <span className="block font-serif uppercase tracking-[-0.02em] leading-none font-bold text-white [-webkit-text-stroke:0.5px_currentColor]">
          unpolished
        </span>
      </span>
    </span>
  );
}
