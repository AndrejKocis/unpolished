export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={["relative inline-flex items-stretch -space-x-px h-[23px] sm:h-[26px]", className].join(" ")}>
      {/* Logo ikona — presne na výšku čierneho rámčeka */}
      <svg
        viewBox="0 0 63 78"
        className="h-full w-auto text-ink shrink-0"
        fill="none"
        aria-hidden="true"
      >
        <path d="M22.0703 0C29.8467 10.9415 34.4209 24.3176 34.4209 38.7637C34.4209 53.4186 29.7132 66.9721 21.7305 78H0C11.2545 68.6454 18.4209 54.5422 18.4209 38.7637C18.4209 23.2494 11.4928 9.35387 0.5625 0H22.0703Z" fill="currentColor" />
        <path d="M62.4209 78H31.4844C32.3426 76.3687 41.4209 58.654 41.4209 39.123C41.4209 18.623 31.4209 0.123047 31.4209 0.123047H62.4209V78Z" fill="currentColor" />
      </svg>
      <span className="bg-ink px-3 py-1 !rounded-r-md flex items-center">
        <span className="block font-serif uppercase tracking-[-0.02em] leading-none font-bold text-white [-webkit-text-stroke:0.5px_currentColor]">
          unpolished
        </span>
      </span>
    </span>
  );
}
