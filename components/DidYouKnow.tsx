import Image from "next/image";
import type { ReactNode } from "react";

export function DidYouKnow({ logo, children }: { logo?: string; children: ReactNode }) {
  return (
    <div className="border-t border-line pt-6 mt-2 flex gap-4 items-start">
      {logo && (
        <Image
          src={logo}
          alt="Logo výrobcu"
          width={48}
          height={48}
          className="shrink-0 mt-1 grayscale object-cover"
        />
      )}
      <div>
        <h3 className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted mb-2">Vedeli ste?</h3>
        <p className="text-15 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
