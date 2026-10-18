"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Tlačidlo „+N“ za aktívnymi stavmi: po kliknutí ukáže zoznam všetkých stavov s áno/nie.
// Zatvorí sa kliknutím mimo alebo Escape, rovnako ako tooltip v StatusFlag.
// Zoznam sa ukotví k najbližšiemu predkovi s `relative` (sekcia Stav hodiniek), aby na mobile nevytiekol z obrazovky.
export function StatusFlagsAll({
  label,
  hiddenCount,
  rows,
}: {
  label: string;
  hiddenCount: number;
  rows: { key: string; icon: ReactNode; text: string; enabled: boolean }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 sm:h-10 min-w-8 sm:min-w-10 px-2 items-center justify-center border border-line text-ink-muted font-mono text-11 tracking-[0.06em] hover:border-ink-muted hover:text-ink transition-colors"
      >
        +{hiddenCount}
      </button>
      {open && (
        <div className="absolute inset-x-0 sm:right-auto sm:w-72 top-full mt-2 z-20 border border-line bg-white p-3 shadow-lg">
          <p className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted mb-2">{label}</p>
          <ul className="flex flex-col gap-2">
            {rows.map(({ key, icon, text, enabled }) => (
              <li key={key} className={["flex items-center gap-3 text-13", enabled ? "text-ink" : "text-ink-muted"].join(" ")}>
                <span className="shrink-0">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
