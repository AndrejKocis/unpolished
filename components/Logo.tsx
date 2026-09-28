const SCRATCHES = [
  { top: "10%", left: "2%", width: "38%", rotate: "-8deg" },
  { top: "78%", left: "34%", width: "30%", rotate: "5deg" },
  { top: "35%", left: "68%", width: "26%", rotate: "-12deg" },
  { top: "58%", left: "12%", width: "20%", rotate: "10deg" },
];

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={["relative inline-block", className].join(" ")}>
      <span className="block font-serif uppercase tracking-[0.22em] leading-none font-bold [-webkit-text-stroke:0.5px_currentColor]">
        unpolished
      </span>
      {/* Škrabance — tenké biele rezy naprieč nápisom, na bielom pozadí Nav */}
      <span aria-hidden className="pointer-events-none absolute inset-0 block">
        {SCRATCHES.map((s, i) => (
          <span
            key={i}
            className="absolute h-[1.5px] bg-white"
            style={{
              top: s.top,
              left: s.left,
              width: s.width,
              transform: `rotate(${s.rotate})`,
            }}
          />
        ))}
      </span>
    </span>
  );
}
