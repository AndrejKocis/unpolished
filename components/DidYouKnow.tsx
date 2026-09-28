import type { ReactNode } from "react";

export function DidYouKnow({ logo, children }: { logo?: string; children: ReactNode }) {
  return (
    <div className="border-t border-line pt-6 mt-2 flex gap-4 items-start">
      {logo && (
        <div className="w-12 h-12 shrink-0 mt-1 flex items-center justify-center bg-white border border-line p-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- malá statická SVG značka, next/image by stratil currentColor theming */}
          <img src={logo} alt="Logo výrobcu" className="w-full h-full object-contain" />
        </div>
      )}
      <div>
        <h3 className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted mb-2">Vedeli ste?</h3>
        <p className="text-15 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
