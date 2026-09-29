export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={["relative inline-flex items-stretch gap-[2px] h-[23px] sm:h-[26px]", className].join(" ")}>
      {/* Logo ikona — presne na výšku čierneho rámčeka, obe hrany zaoblené (vonkajšia aj vnútorná) */}
      <svg
        viewBox="0 0 908 1576"
        className="h-full w-auto text-ink shrink-0"
        aria-hidden="true"
      >
        <g transform="translate(0,1576) scale(0.1,-0.1)" fill="currentColor" stroke="none">
          <path d="M820 14001 l0 -988 63 -38 c215 -132 481 -324 688 -495 165 -138 568
-542 702 -705 751 -914 1175 -1937 1289 -3115 17 -180 17 -820 0 -1000 -115
-1186 -559 -2245 -1320 -3150 -136 -162 -502 -527 -661 -659 -214 -178 -466
-360 -683 -495 l-78 -48 0 -989 0 -988 73 30 c366 154 896 450 1266 708 112
77 157 103 195 111 28 5 850 158 1826 340 976 182 1796 335 1821 341 115 26
192 164 155 277 l-7 22 -775 0 -774 0 0 65 0 65 -530 0 c-291 0 -530 3 -530 8
0 4 46 61 101 127 328 391 626 841 892 1346 l67 127 0 3262 0 3263 -67 126
c-254 483 -515 883 -820 1258 -46 57 -83 105 -83 108 0 3 579 5 1286 5 1161 0
1289 2 1320 16 156 74 167 309 19 391 -29 16 -563 128 -1989 418 l-1950 396
-80 58 c-411 294 -1026 640 -1393 782 l-23 9 0 -989z" />
        </g>
      </svg>
      <span className="logo-badge bg-ink px-2 py-1 !rounded-r-md flex items-center">
        <span className="logo-badge-text block font-serif uppercase tracking-[-0.02em] leading-none font-bold text-white [-webkit-text-stroke:0.5px_currentColor]">
          unpolished
        </span>
      </span>
    </span>
  );
}
