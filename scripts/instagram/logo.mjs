// Logo unpolished ako PNG pre Instagram koncepty: celé čierne (#111), odznak bez bieleho podkladu.
// Skladá sa z rovnakých SVG ako hlavička webu (components/Logo.tsx), vyberie ich z buildu docs/index.html.
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = require("sharp");

const INK = "#111111";
const NONE = "rgba(0,0,0,0)"; // výplň odznaku a medzera pri obryse ostávajú priehľadné

export async function logoPng(width) {
  const html = fs.readFileSync(new URL("../../docs/index.html", import.meta.url), "utf8");
  const start = html.indexOf('<span class="relative inline-flex items-stretch');
  const svgs = html.slice(start).match(/<svg[\s\S]*?<\/svg>/g).slice(0, 3);
  const [crescent, badge, text] = svgs.map((s) =>
    s
      .replace(/^<svg[^>]*?(viewBox="[^"]*")[^>]*>/, "<svg $1 VIEWPORT>")
      .replaceAll("var(--ink)", INK)
      .replace(/style="stroke:([^"]*)"/g, 'stroke="$1"'),
  );
  // Rozmery ako v hlavičke webu: odznak výška 29, ikona 27 (zvislo na stred), ikona prekrýva odznak o 4 px, odznak scaleX 1.05.
  const k = 20;
  const H = 29 * k;
  const cw = (35 / 78) * 27 * k;
  const bx = cw - 4 * k;
  const bw = (1742 / 460) * H;
  const total = bx + bw * 1.05;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${total}" height="${H}">
    <g color="${INK}">${crescent.replace("VIEWPORT", `x="0" y="${k}" width="${cw}" height="${27 * k}"`)}</g>
    <g color="${NONE}" transform="translate(${bx},0) scale(1.05,1)">${badge.replace("VIEWPORT", `x="0" y="0" width="${bw}" height="${H}"`)}</g>
    <g color="${INK}" transform="translate(${bx},0)">${text.replace("VIEWPORT", `x="0" y="0" width="${bw}" height="${H}"`)}</g>
  </svg>`;
  return sharp(Buffer.from(svg)).resize({ width: Math.round(width) }).png().toBuffer();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fs.writeFileSync(process.argv[2] ?? "logo.png", await logoPng(Number(process.argv[3] ?? 800)));
}
