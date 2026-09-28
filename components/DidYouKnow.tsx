import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";

async function InlineLogo({ src }: { src: string }) {
  const filePath = path.join(process.cwd(), "public", src);
  const raw = await readFile(filePath, "utf-8");
  // Odstránime XML/DOCTYPE hlavičku — necháme iba samotný <svg> element,
  // aby sme ho mohli vložiť inline a nechať dediť farbu (currentColor).
  const svg = raw.replace(/^[\s\S]*?(<svg)/, "$1");

  return (
    <div
      className="w-10 h-10 shrink-0 mt-1 text-ink [&>svg]:h-full [&>svg]:w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function DidYouKnow({ logo, children }: { logo?: string; children: ReactNode }) {
  return (
    <div className="border-t border-line pt-6 mt-2 flex gap-4 items-start">
      {logo && <InlineLogo src={logo} />}
      <div>
        <h3 className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted mb-2">Vedeli ste?</h3>
        <p className="text-15 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
