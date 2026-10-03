import { readFile } from "node:fs/promises";
import path from "node:path";
import Image from "next/image";
import type { ReactNode } from "react";
import { assetPath } from "@/lib/constants";

async function InlineLogo({ src }: { src: string }) {
  if (!src.endsWith(".svg")) {
    // Fotografická predloha (napr. vyrytý logo na zadnom kryte) — príliš
    // zašumená na čistý vektor, zobrazí sa ako odfarbená fotka namiesto
    // currentColor tvaru.
    return (
      <Image
        src={assetPath(src)}
        alt="Logo výrobcu"
        width={128}
        height={104}
        className="w-24 h-auto mb-3 grayscale opacity-80"
      />
    );
  }

  const filePath = path.join(process.cwd(), "public", src);
  const raw = await readFile(filePath, "utf-8");
  // Odstránime XML/DOCTYPE hlavičku — necháme iba samotný <svg> element,
  // aby sme ho mohli vložiť inline a nechať dediť farbu (currentColor).
  const svg = raw.replace(/^[\s\S]*?(<svg)/, "$1");

  return (
    <div
      className="w-24 h-16 mb-3 text-ink [&>svg]:h-full [&>svg]:w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function DidYouKnow({ logo, children }: { logo?: string; children: ReactNode }) {
  return (
    <div className="border-t border-line pt-6 mt-2">
      {logo && <InlineLogo src={logo} />}
      <h3 className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted mb-2">Vedeli ste?</h3>
      <div className="text-15 leading-relaxed [&>p]:mb-0">{children}</div>
    </div>
  );
}
