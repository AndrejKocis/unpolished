// Podklady pre profil @unpolished.watches: obaly highlights a story obrázky (ABOUT, SERVICE, SHIPPING).
//   node scripts/instagram/profile.mjs   → instagram/profile/highlights/*.png, instagram/profile/stories/*.png
// Texty sú z webu (lib/i18n/dictionaries.ts: about, watchDetail, home.trust), angličtina hore, čeština dole.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { logoPng } from "./logo.mjs";
const require = createRequire(import.meta.url);
const sharp = require("sharp");

const OUT = new URL("../../instagram/profile/", import.meta.url).pathname;
const W = 1080;
const H = 1920;
const PAPER = "#f4f4f4";
const INK = "#111111";
const MUTED = "#6b6b6b";
const SERIF = "Georgia, serif";
const MONO = "Menlo, monospace";

const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;");

// Jednoduché zalamovanie podľa počtu znakov (SVG text sa sám nezalamuje).
function wrap(text, max) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && (line + " " + word).length > max) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  return line ? [...lines, line] : lines;
}

// Obal highlightu: čierne pozadie, nápis v strede (Instagram z neho vyreže kruh), ako PWA.
async function highlight(label) {
  const size = label.length > 7 ? 92 : 110;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="100%" height="100%" fill="${INK}"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family="${MONO}" font-weight="bold"
      font-size="${size}" letter-spacing="${size * 0.04}" fill="${PAPER}">${label}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, "highlights", `${label.toLowerCase()}.png`));
}

// Story: papier, nadpis serifom, anglický text, oddeľovač, český text, logo dole.
async function story(name, { eyebrow, title, en, cs }) {
  let y = 300;
  let body = `<text x="90" y="${y}" font-family="${MONO}" font-size="30" letter-spacing="2" fill="${MUTED}">${esc(eyebrow)}</text>`;
  y += 120;
  for (const l of wrap(title, 18)) {
    body += `<text x="90" y="${y}" font-family="${SERIF}" font-size="96" fill="${INK}">${esc(l)}</text>`;
    y += 108;
  }
  y += 40;
  for (const p of en) {
    for (const l of wrap(p, 38)) {
      body += `<text x="90" y="${y}" font-family="${SERIF}" font-size="44" fill="${INK}">${esc(l)}</text>`;
      y += 60;
    }
    y += 28;
  }
  y += 20;
  body += `<line x1="90" x2="${W - 90}" y1="${y}" y2="${y}" stroke="${INK}" stroke-opacity="0.2" stroke-width="2"/>`;
  y += 80;
  for (const p of cs) {
    for (const l of wrap(p, 50)) {
      body += `<text x="90" y="${y}" font-family="${SERIF}" font-size="34" fill="${MUTED}">${esc(l)}</text>`;
      y += 48;
    }
    y += 20;
  }
  if (y > H - 260) throw new Error(`${name}: text je príliš dlhý (${y} px)`);
  const logo = await logoPng(300);
  const logoH = (await sharp(logo).metadata()).height;
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <rect width="100%" height="100%" fill="${PAPER}"/>${body}
      <text x="90" y="${H - 160 + logoH / 2}" dominant-baseline="central" font-family="${MONO}" font-size="30" fill="${MUTED}">unpolished.cz</text>
    </svg>`))
    .composite([{ input: logo, left: W - 300 - 90, top: H - 160 }])
    .png()
    .toFile(path.join(OUT, "stories", `${name}.png`));
}

fs.mkdirSync(path.join(OUT, "highlights"), { recursive: true });
fs.mkdirSync(path.join(OUT, "stories"), { recursive: true });
for (const label of ["AVAILABLE", "SOLD", "ABOUT", "SERVICE", "SHIPPING"]) await highlight(label);

await story("about", {
  eyebrow: "ABOUT",
  title: "Unpolished.",
  en: [
    "I only sell vintage watches whose case was never repolished. A polishing wheel takes away the facets and edges the maker cut, and that loss is permanent.",
    "One person, a small inventory. I inspect, service and photograph every piece myself.",
  ],
  cs: [
    "Prodávám jen vintage hodinky, jejichž pouzdro nikdy neprošlo leštičkou. Leštění vezme fazety a hrany, které vybrousil výrobce, a to nevratně.",
    "Jeden člověk, malý inventář. Každý kus osobně kontroluji, nechávám servisovat a fotím.",
  ],
});
await story("service", {
  eyebrow: "SERVICE",
  title: "Serviced inside, untouched outside.",
  en: [
    "Every piece is serviced before it goes on sale. The exact scope of service is listed with each watch.",
    "The service carries a 6-month warranty covering the movement.",
  ],
  cs: [
    "Každý kus před prodejem projde servisem. Přesný rozsah servisu je uveden u každých hodinek.",
    "Na servis poskytuji záruku 6 měsíců, která kryje funkčnost strojku.",
  ],
});
await story("shipping", {
  eyebrow: "SHIPPING",
  title: "Free EU shipping.",
  en: [
    "Insured, with a signature on delivery.",
    "14 days to return from delivery, in the condition the watch was sent.",
  ],
  cs: [
    "Doprava v rámci EU zdarma, pojištěná, s podpisem při převzetí.",
    "Na vrácení máte 14 dní od doručení, ve stavu, v jakém byly hodinky odeslány.",
  ],
});
console.log(fs.readdirSync(path.join(OUT, "highlights")).join(" "), "|", fs.readdirSync(path.join(OUT, "stories")).join(" "));
