export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={["relative inline-flex items-stretch h-[24px] sm:h-[29px]", className].join(" ")}>
      {/* logo3.svg — samostatná ikona pred hlavným odznakom, rovnaká výška */}
      <svg viewBox="0 0 35 78" className="h-[22px] sm:h-[27px] self-center w-auto text-ink shrink-0 -mr-[4px]" fill="none" aria-hidden="true">
        <path
          d="M22.0703 0C29.8467 10.9415 34.4209 24.3176 34.4209 38.7637C34.4209 53.4186 29.7132 66.9721 21.7305 78H0C11.2545 68.6454 18.4209 54.5422 18.4209 38.7637C18.4209 23.2494 11.4928 9.35387 0.5625 0H22.0703Z"
          fill="currentColor"
        />
      </svg>
      <span className="logo-slide-in relative h-full">
        {/* Celý tvar (ikona + odznak) vektorizovaný z jedného referenčného obrázka —
            dve samostatné podcesty v jednej <path>, spojené tenkou medzerou. */}
        <svg
          viewBox="0 0 1742 460"
          className="h-full w-auto text-ink block"
          style={{ transform: "scaleX(1.05)", transformOrigin: "left" }}
          aria-hidden="true"
        >
          <defs>
            {/* Odznak je čistá geometria (obdĺžnik s pravými rohmi R 760; za textom je vpravo ~1 px voľného miesta), nie obkreslený bitmapový tvar —
                obkreslenie malo nerovnomerné „schodovité“ rohy, viditeľné najmä pri malom logu na mobile. */}
            {/* Obrys odznaku (len hlavný odznak, bez ľavej hrany): linka vo farbe pozadia (--white) vnútri tvaru, kúsok od okraja.
                Ťahy idú po kópii tvaru s ľavou hranou posunutou von (x 1500), takže ľavá strana sa odreže.
                Dielik vľavo má len hornú a dolnú linku (obdĺžnik s bokmi mimo dielika, orezaný na jeho tvar).
                Oba ťahy sú orezané na tvar; hrubší ťah dá linku, tenší ťah vo farbe odznaku medzeru od okraja.
                Jednotky sú v priestore cesty: 1 px loga ≈ 126 jednotiek. */}
            <clipPath id="logo-clip">
              <use href="#logo-badge" />
            </clipPath>
            <clipPath id="logo-clip-piece">
              <use href="#logo-piece" />
            </clipPath>
          </defs>
          <g transform="translate(0,460) scale(0.1,-0.1)" fill="currentColor" stroke="none">
            <path id="logo-piece" d="M371 4048 c185 -365 354 -917 413 -1345 94 -679 -32 -1407 -375
-2168 -33 -71 -59 -131 -59 -132 0 -2 331 -3 735 -3 l735 0 -2 1853 -3 1852
-738 3 -737 2 31 -62z" />
            <path id="logo-badge" d="M2080 400 H16410 A760 760 0 0 1 17170 1160 V3350 A760 760 0 0 1 16410 4110 H2080 Z" />
            <g clipPath="url(#logo-clip)" fill="none">
              <path d="M1500 400 H16410 A760 760 0 0 1 17170 1160 V3350 A760 760 0 0 1 16410 4110 H1500 Z" strokeWidth="560" style={{ stroke: "var(--white)" }} />
              <path d="M1500 400 H16410 A760 760 0 0 1 17170 1160 V3350 A760 760 0 0 1 16410 4110 H1500 Z" strokeWidth="300" stroke="currentColor" />
            </g>
            <g clipPath="url(#logo-clip-piece)" fill="none">
              <path d="M-500 400 H2600 V4110 H-500 Z" strokeWidth="560" style={{ stroke: "var(--white)" }} />
              <path d="M-500 400 H2600 V4110 H-500 Z" strokeWidth="300" stroke="currentColor" />
            </g>
          </g>
        </svg>
        {/* Písmo a odsadenie v cqw (% šírky textového poľa), aby text sedel v odznaku pri každej výške loga. */}
        <span
          className="absolute inset-y-0 flex items-center [container-type:inline-size]"
          style={{ left: "11.99%", right: "2.4%" }}
        >
          <span
            className="logo-badge-text relative top-[0.046em] block font-serif uppercase tracking-[0.08em] leading-none font-bold text-white [-webkit-text-stroke:0.5px_currentColor]"
            style={{ fontSize: "17cqw", marginLeft: "6.4cqw" }}
          >
            unpolished
          </span>
        </span>
      </span>
    </span>
  );
}
