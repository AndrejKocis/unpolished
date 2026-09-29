const STRIP_COUNT = 10;
const STRIP_DELAY_STEP = 0.08; // s — fázový posun medzi susednými pásikmi

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={["relative inline-flex items-stretch gap-[2px] h-[23px] sm:h-[26px]", className].join(" ")}>
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
      <span className="logo-badge relative !rounded-r-md overflow-hidden flex items-stretch">
        {/* Pozadie rozdelené na tenké pásiky — každý s vlastným oneskorením
            animácie, aby sa vlnili postupne (skutočná "plasticita" plátna),
            nie ako jedna tuhá rovina otáčajúca sa okolo osi. */}
        <span className="logo-strips absolute inset-0 flex" aria-hidden="true">
          {Array.from({ length: STRIP_COUNT }).map((_, i) => (
            <span
              key={i}
              className="logo-strip bg-ink flex-1 -mr-px"
              style={{ animationDelay: `${3 + i * STRIP_DELAY_STEP}s` }}
            />
          ))}
        </span>
        <span className="relative px-2 py-1 flex items-center">
          <span className="logo-badge-text block font-serif uppercase tracking-[-0.02em] leading-none font-bold text-white [-webkit-text-stroke:0.5px_currentColor]">
            unpolished
          </span>
        </span>
      </span>
    </span>
  );
}
