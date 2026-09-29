export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={["relative inline-flex items-stretch h-[30px] sm:h-[34px]", className].join(" ")}>
      {/* logo3.svg — samostatná ikona pred hlavným odznakom, rovnaká výška */}
      <svg viewBox="0 0 35 78" className="h-[28px] sm:h-[32px] self-center w-auto text-ink shrink-0 -mr-[4px]" fill="none" aria-hidden="true">
        <path
          d="M22.0703 0C29.8467 10.9415 34.4209 24.3176 34.4209 38.7637C34.4209 53.4186 29.7132 66.9721 21.7305 78H0C11.2545 68.6454 18.4209 54.5422 18.4209 38.7637C18.4209 23.2494 11.4928 9.35387 0.5625 0H22.0703Z"
          fill="currentColor"
        />
      </svg>
      <span className="logo-slide-in relative h-full">
        {/* Celý tvar (ikona + odznak) vektorizovaný z jedného referenčného obrázka —
            dve samostatné podcesty v jednej <path>, spojené tenkou medzerou. */}
        <svg
          viewBox="0 0 1726 460"
          className="h-full w-auto text-ink block"
          aria-hidden="true"
        >
          <g transform="translate(0,460) scale(0.1,-0.1)" fill="currentColor" stroke="none">
            <path d="M371 4048 c185 -365 354 -917 413 -1345 94 -679 -32 -1407 -375
-2168 -33 -71 -59 -131 -59 -132 0 -2 331 -3 735 -3 l735 0 -2 1853 -3 1852
-738 3 -737 2 31 -62z M2080 2255 l0 -1855 7105 0 c4730 0 7105 3 7105 10 0 6
21 10 46 10 27 0 51 6 60 15 9 8 26 15 40 15 13 0 24 5 24 10 0 6 11 10 25 10
14 0 25 5 25 10 0 6 7 10 15 10 15 0 64 27 75 41 3 3 15 9 28 13 12 4 22 12
22 17 0 5 5 9 11 9 11 0 179 164 179 175 0 4 6 13 13 20 31 36 37 46 37 65 0
11 5 20 10 20 6 0 10 6 10 14 0 7 7 19 15 26 8 7 15 23 15 36 0 13 5 24 10 24
6 0 10 13 10 29 0 17 4 32 9 36 6 3 13 27 17 53 3 26 10 52 15 58 16 20 5
2249 -11 2317 -7 31 -17 57 -22 57 -4 0 -8 16 -8 35 0 19 -4 35 -10 35 -5 0
-10 6 -10 14 0 18 -32 76 -42 76 -5 0 -8 9 -8 21 0 11 -6 27 -12 34 -28 31
-38 44 -38 50 0 4 -20 26 -45 51 -25 24 -45 46 -45 49 0 8 -27 35 -35 35 -4 0
-22 16 -41 35 -18 19 -41 35 -50 35 -8 0 -22 6 -29 13 -36 31 -46 37 -65 37
-11 0 -20 5 -20 10 0 6 -11 10 -25 10 -14 0 -25 4 -25 10 0 5 -16 12 -35 16
-19 3 -35 10 -35 15 0 5 -22 9 -50 9 -27 0 -50 5 -50 10 0 7 -2375 10 -7105
10 l-7105 0 0 -1855z" />
          </g>
        </svg>
        <span className="absolute inset-y-0 flex items-center" style={{ left: "12.1%", right: "1.5%" }}>
          <span
            className="logo-badge-text block font-serif uppercase tracking-[0.08em] leading-none font-bold text-white [-webkit-text-stroke:0.5px_currentColor]"
            style={{ marginLeft: "10px" }}
          >
            unpolished
          </span>
        </span>
      </span>
    </span>
  );
}
