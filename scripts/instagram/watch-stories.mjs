// Stories do highlightu AVAILABLE: jedna story (1080×1920) na hodinky z poster fotky karty.
//   node scripts/instagram/watch-stories.mjs <priečinok> <slug> [<slug>…]
// Výstup instagram/drafts/<priečinok>/01-<slug>.jpg…, zverejnenie: publish.mjs <priečinok> --story.
// Texty po anglicky (Instagram EN prvá), bez ceny: „Details & price: link in bio“.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { logoPng } from "./logo.mjs";
const require = createRequire(import.meta.url);
const sharp = require("sharp");
const matter = require("gray-matter");

const ROOT = new URL("../../", import.meta.url).pathname;
const W = 1080;
const H = 1920;
const PAPER = "#f4f4f4";
const INK = "#111111";
const MUTED = "#6b6b6b";
// Logo na stred pod lištou stories, fotka 4:5 so štítkom AVAILABLE vľavo hore (ako štítok SOLD na kartách webu),
// text pod fotkou; dole ostáva ~280 px pre pole na odpoveď.
const LOGO_W = 300;
const LOGO_Y = 230;
const PHOTO = { x: 100, y: 330, w: 880, h: 1100 };

const [folder, ...slugs] = process.argv.slice(2);
if (!folder || !slugs.length) throw new Error("Použitie: node scripts/instagram/watch-stories.mjs <priečinok> <slug>…");
const out = path.join(ROOT, "instagram/drafts", folder);
fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(out)) if (f.endsWith(".jpg")) fs.rmSync(path.join(out, f));

const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
const logo = await logoPng(LOGO_W);
const logoH = (await sharp(logo).metadata()).height;

for (const [i, slug] of slugs.entries()) {
  const { data: w } = matter(fs.readFileSync(path.join(ROOT, "content/watches", `${slug}.mdx`), "utf8"));
  const media = path.join(ROOT, "public/watches", w.media);
  const cover = w.videoPoster ?? w.images[0];
  const photo = await sharp(path.join(media, cover)).resize(PHOTO.w, PHOTO.h, { fit: "cover" }).toBuffer();
  const name = `${w.brand} ${w.model.replace(/"/g, "")}`;
  const material = (w.en?.caseMaterial ?? w.caseMaterial).split(",")[0];
  const meta = `${w.year} · ${w.caseSize} mm · ${material}`;
  // Dlhý názov na dva riadky, aby nevytiekol za okraj.
  const nameSize = 56;
  const nameLines = [];
  for (const word of name.split(" ")) {
    const last = nameLines.at(-1);
    if (last && (last + " " + word).length <= 30) nameLines[nameLines.length - 1] = `${last} ${word}`;
    else nameLines.push(word);
  }
  let y = PHOTO.y + PHOTO.h + 90;
  const nameSvg = nameLines
    .map((l, k) => `<text x="${PHOTO.x}" y="${y + k * 66}" font-family="Georgia, serif" font-size="${nameSize}" fill="${INK}">${esc(l)}</text>`)
    .join("");
  y += (nameLines.length - 1) * 66;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect x="${PHOTO.x + 36}" y="${PHOTO.y + 36}" width="236" height="60" fill="#ffffff"/>
    <text x="${PHOTO.x + 36 + 118}" y="${PHOTO.y + 36 + 31}" text-anchor="middle" dominant-baseline="central" font-family="Menlo, monospace" font-size="28" letter-spacing="2" fill="${INK}">AVAILABLE</text>
    ${nameSvg}
    <text x="${PHOTO.x}" y="${(y += 62)}" font-family="Menlo, monospace" font-size="30" fill="${MUTED}">${esc(meta)}</text>
    <text x="${PHOTO.x}" y="${(y += 56)}" font-family="Menlo, monospace" font-size="30" fill="${INK}">Details &amp; price: link in bio</text>
  </svg>`;
  const file = `${String(i + 1).padStart(2, "0")}-${slug}.jpg`;
  await sharp({ create: { width: W, height: H, channels: 3, background: PAPER } })
    .composite([
      { input: photo, left: PHOTO.x, top: PHOTO.y },
      { input: Buffer.from(svg), left: 0, top: 0 },
      { input: logo, left: Math.round((W - LOGO_W) / 2), top: LOGO_Y },
    ])
    .jpeg({ quality: 90 })
    .toFile(path.join(out, file));
  console.log(file);
}
