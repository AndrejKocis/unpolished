// Textový carousel z instagram/drafts/<slug>/slides.json → 01.jpg… (1080×1350) v štýle webu.
//   node scripts/instagram/slides.mjs <slug>
// Slajd: { kind?: "cover" | "cover-full" | "recap" | "cta" | "photo", photo?: "<media>/<súbor>" z public/watches, focusY?: zvislý stred výrezu fotky
//   (0–1, predvolene 0,5), title, body?, sub?, items?, follow? (výrazná výzva na cta slajde) }
// kind "photo": fotka na celú plochu (poster karty z webu) so štítkom vľavo dole: title = názov, sub = rok a detail.
// Každá slajda má číslo (3/10) a handle, obsah drží 120 px od okrajov (orez mriežky profilu).
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { logoPng } from "./logo.mjs";
const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = new URL("../../", import.meta.url).pathname;
const W = 1080;
const H = 1350;
const PAD = 120;
const PAPER = "#f4f4f4";
const INK = "#111111";
const MUTED = "#6b6b6b";
const ACCENT = "#b3261e"; // tlmená červená (ako červené detaily na ciferníkoch), len pre výzvu na sledovanie
const SERIF = "Georgia, serif";
const MONO = "Menlo, monospace";

const slug = process.argv[2];
if (!slug) throw new Error("Použitie: node scripts/instagram/slides.mjs <slug>");
const dir = path.join(ROOT, "instagram/drafts", slug);
const { handle, slides } = JSON.parse(fs.readFileSync(path.join(dir, "slides.json"), "utf8"));

const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
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
const textLines = (lines, x, y, size, gap, attrs) =>
  lines.map((l, i) => `<text x="${x}" y="${y + i * gap}" ${attrs} font-size="${size}">${esc(l)}</text>`).join("");

// Výrez fotky na plnú šírku a výšku h, zvislý stred výrezu na focusY (0 = vrch fotky, 1 = spodok).
async function photoCrop(file, h, focusY) {
  const img = sharp(file).rotate();
  const { width, height } = await img.metadata();
  let cw = width;
  let ch = Math.round((h / W) * width);
  // Fotka je na požadovaný pomer príliš nízka (napr. štvorec na 4:5): orež šírku na strede namiesto výšky.
  if (ch > height) {
    ch = height;
    cw = Math.round((W / h) * height);
  }
  const left = Math.round((width - cw) / 2);
  const top = Math.max(0, Math.min(height - ch, Math.round(focusY * height - ch / 2)));
  return sharp(file).rotate().extract({ left, top, width: cw, height: ch }).resize(W, h).toBuffer();
}

const logo = await logoPng(260);
const logoH = (await sharp(logo).metadata()).height;
for (const f of fs.readdirSync(dir)) if (/^\d+\.jpg$/.test(f)) fs.rmSync(path.join(dir, f));

for (const [i, s] of slides.entries()) {
  const n = `${i + 1}/${slides.length}`;
  const overlays = [];
  let photoH = 0;
  if (s.kind === "cover-full") {
    // Cover cez celú plochu: fotka, tmavý prechod dole a biely nadpis, aby bol čitateľný aj v malej mriežke profilu.
    // Dlhší nadpis menším písmom, aby zabral max. 3 riadky a nezakryl hodinky.
    const long = s.title.length > 28;
    const size = long ? 76 : 96;
    const gap = long ? 84 : 104;
    const t = wrap(s.title, long ? 20 : 14);
    const ty = H - 150 - (t.length - 1) * gap - (s.sub ? 70 : 0);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.75"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#g)"/>
      ${textLines(t, PAD, ty, size, gap, `font-family="${SERIF}" fill="#ffffff"`)}
      ${s.sub ? `<text x="${PAD}" y="${ty + t.length * gap - 10}" font-family="${SERIF}" font-style="italic" font-size="44" fill="#ffffff" fill-opacity="0.85">${esc(s.sub)}</text>` : ""}
      <text x="${W - PAD}" y="${H - 70}" text-anchor="end" font-family="${MONO}" font-size="28" fill="#ffffff">${n}</text>
    </svg>`;
    await sharp(await photoCrop(path.join(ROOT, "public/watches", s.photo), H, s.focusY ?? 0.5))
      .composite([{ input: Buffer.from(svg) }])
      .jpeg({ quality: 92 })
      .toFile(path.join(dir, `${String(i + 1).padStart(2, "0")}.jpg`));
    continue;
  }
  if (s.kind === "photo") {
    // Celoplošná fotka hodiniek a biely štítok s názvom vľavo dole (nad číslom a handle).
    const label = `<rect x="${PAD - 24}" y="${H - 300}" width="${W - 2 * PAD + 48}" height="150" fill="#ffffff" fill-opacity="0.92"/>
      <text x="${PAD}" y="${H - 236}" font-family="${SERIF}" font-size="${s.title.length > 32 ? 38 : 46}" fill="${INK}">${esc(s.title)}</text>
      <text x="${PAD}" y="${H - 186}" font-family="${MONO}" font-size="28" fill="${MUTED}">${esc(s.sub ?? "")}</text>
      <text x="${PAD}" y="${H - 70}" font-family="${MONO}" font-size="28" fill="#ffffff">${esc(handle)}</text>
      <text x="${W - PAD}" y="${H - 70}" text-anchor="end" font-family="${MONO}" font-size="28" fill="#ffffff">${n}</text>`;
    await sharp(await photoCrop(path.join(ROOT, "public/watches", s.photo), H, s.focusY ?? 0.5))
      .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <rect y="${H - 130}" width="${W}" height="130" fill="#000" fill-opacity="0.35"/>${label}</svg>`) }])
      .jpeg({ quality: 92 })
      .toFile(path.join(dir, `${String(i + 1).padStart(2, "0")}.jpg`));
    continue;
  }
  if (s.photo) {
    photoH = s.kind === "cover" ? 760 : 560;
    overlays.push({
      input: await photoCrop(path.join(ROOT, "public/watches", s.photo), photoH, s.focusY ?? 0.5),
      left: 0,
      top: 0,
    });
  }
  let svg = "";
  // Textové slajdy bez fotky: blok textu zvislo na stred (nad pätou s handle a číslom).
  const titleSize = s.kind === "cta" ? 80 : 68;
  const titleLines = wrap(s.title, s.kind === "cta" ? 20 : 22);
  const bodyLines = s.body ? wrap(s.body, 38) : [];
  const recapH = s.items ? 110 + s.items.reduce((h, it) => h + wrap(it, 34).length * 54 + 30, 0) : 0;
  const followH = s.follow ? 60 + 250 : 0;
  const blockH = s.kind === "recap" ? recapH : titleLines.length * titleSize * 1.15 + 40 + bodyLines.length * 58 + followH;
  let y = photoH ? photoH + 110 : Math.round((H - 120 - blockH) / 2 + titleSize * 0.8);
  const serif = `font-family="${SERIF}" fill="${INK}"`;
  if (s.kind === "cover") {
    const t = wrap(s.title.toUpperCase(), 16);
    svg += textLines(t, PAD, y, 84, 96, `${serif} letter-spacing="1"`);
    y += t.length * 96 + 10;
    svg += textLines(wrap(s.sub, 40), PAD, y, 40, 54, `font-family="${SERIF}" fill="${MUTED}" font-style="italic"`);
  } else if (s.kind === "recap") {
    svg += `<text x="${PAD}" y="${y}" ${serif} font-size="72">${esc(s.title)}</text>`;
    y += 110;
    for (const item of s.items) {
      const l = wrap(item, 34);
      svg += `<circle cx="${PAD + 10}" cy="${y - 14}" r="7" fill="${INK}"/>`;
      svg += textLines(l, PAD + 44, y, 42, 54, serif);
      y += l.length * 54 + 30;
    }
  } else {
    svg += textLines(titleLines, PAD, y, titleSize, titleSize * 1.15, serif);
    if (s.kind === "cta") overlays.push({ input: logo, left: PAD, top: Math.round(y - titleSize - 60 - logoH) });
    y += titleLines.length * titleSize * 1.15 + 40;
    svg += textLines(bodyLines, PAD, y, 42, 58, `font-family="${SERIF}" fill="${s.kind === "cta" ? MUTED : INK}"`);
    // Výzva na sledovanie (variant E): tenká linka, červený štítok FOLLOW, veľký handle, pod ním dôvod kurzívou.
    if (s.follow) {
      const fy = y + bodyLines.length * 58 + 60;
      svg += `<line x1="${PAD}" x2="${W - PAD}" y1="${fy}" y2="${fy}" stroke="${INK}" stroke-opacity="0.15" stroke-width="2"/>`;
      svg += `<text x="${PAD}" y="${fy + 80}" font-family="${MONO}" font-size="30" letter-spacing="4" fill="${ACCENT}">FOLLOW</text>`;
      svg += `<text x="${PAD}" y="${fy + 170}" font-family="${SERIF}" font-size="74" fill="${INK}">${esc(handle)}</text>`;
      svg += `<text x="${PAD}" y="${fy + 232}" font-family="${SERIF}" font-style="italic" font-size="40" fill="${MUTED}">${esc(s.follow)}</text>`;
    }
  }
  svg += `<text x="${PAD}" y="${H - 70}" font-family="${MONO}" font-size="28" fill="${MUTED}">${esc(handle)}</text>`;
  svg += `<text x="${W - PAD}" y="${H - 70}" text-anchor="end" font-family="${MONO}" font-size="28" fill="${MUTED}">${n}</text>`;
  await sharp({ create: { width: W, height: H, channels: 3, background: PAPER } })
    .composite([...overlays, { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg}</svg>`), left: 0, top: 0 }])
    .jpeg({ quality: 92 })
    .toFile(path.join(dir, `${String(i + 1).padStart(2, "0")}.jpg`));
}
console.log(fs.readdirSync(dir).filter((f) => f.endsWith(".jpg")).join(" "));
