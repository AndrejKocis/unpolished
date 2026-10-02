import Link from "next/link";

export function ViewAllWatchesCard({ label }: { label: string }) {
  return (
    <Link
      href="/watches"
      className="group flex flex-col items-center justify-center gap-3 bg-paper hover:border-ink border border-transparent transition-[border-color] duration-150 aspect-[4/5] sm:aspect-auto sm:h-full min-h-[200px]"
    >
      <span className="font-serif text-18 text-ink">{label}</span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-5 w-5 text-ink transition-transform duration-150 group-hover:translate-x-1"
      >
        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
