"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Ikona stavu s tooltipom: zobrazí sa pri hoveri a fokuse (CSS), na dotykových
// zariadeniach ťuknutím (stav `open`), skryje sa ťuknutím mimo alebo Escape.
export function StatusFlag({
  icon,
  text,
  enabled,
  align,
}: {
  icon: ReactNode;
  text: string;
  enabled: boolean;
  align: "start" | "center" | "end";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Krajné ikony zarovnaj k okraju, aby tooltip nevytiekol mimo obrazovky.
  const position = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }[align];

  return (
    <button
      ref={ref}
      type="button"
      aria-label={text}
      onClick={() => setOpen((v) => !v)}
      className={[
        "group relative flex h-9 w-9 items-center justify-center",
        enabled ? "text-ink" : "text-line",
      ].join(" ")}
    >
      {icon}
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute bottom-full mb-2 whitespace-nowrap bg-ink text-white px-2 py-1 font-mono text-11 uppercase tracking-[0.06em] z-10",
          position,
          open ? "block" : "hidden group-hover:block group-focus-visible:block",
        ].join(" ")}
      >
        {text}
      </span>
    </button>
  );
}
