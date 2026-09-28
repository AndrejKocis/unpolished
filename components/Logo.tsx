export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={["relative inline-block bg-ink px-2 py-1", className].join(" ")}>
      <span className="block font-serif uppercase tracking-[-0.02em] leading-none font-bold text-white [-webkit-text-stroke:0.5px_currentColor]">
        unpolished
      </span>
    </span>
  );
}
