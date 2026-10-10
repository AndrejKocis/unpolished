// Instagram koncept z hodiniek na webe: node scripts/instagram/draft.mjs <slug>
// Výstup v instagram/drafts/<slug>/:
//   na predaj — carousel 01.jpg… (1080×1350, logo len na prvej) + reel.mp4 (1080×1920, loop + pár fotiek, s logom)
//   predané   — 01.jpg s poster fotkou, štítkom „SOLD“ vľavo hore (ako karta na webe) a logom
// Popis (caption.md) píše agent zvlášť, podľa pravidiel v instagram/README.md.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { logoPng } from "./logo.mjs";
const require = createRequire(import.meta.url);
const sharp = require("sharp");
const matter = require("gray-matter");

const ROOT = new URL("../../", import.meta.url).pathname;
const W = 1080;
const H = 1350; // 4:5, najväčší pomer, ktorý Instagram v carouseli ukáže celý
const REEL_H = 1920;
const LOGO_W = Math.round(W * 0.12);
const MARGIN = 40;
const MAX_PHOTOS = 6;
const REEL_PHOTOS = 3;
const REEL_PHOTO_SECONDS = 2.5;

const slug = process.argv[2];
if (!slug) throw new Error("Použitie: node scripts/instagram/draft.mjs <slug>");
const { data: watch } = matter(fs.readFileSync(path.join(ROOT, "content/watches", `${slug}.mdx`), "utf8"));
const media = path.join(ROOT, "public/watches", watch.media);
const out = path.join(ROOT, "instagram/drafts", slug);
// Zmaže len vygenerované médiá, popis (caption.md) píše agent a ostáva.
fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(out)) if (/\.(jpg|mp4)$/.test(f)) fs.rmSync(path.join(out, f));

const logo = await logoPng(LOGO_W);
const logoH = (await sharp(logo).metadata()).height;
const cover = watch.videoPoster ?? watch.images[0];

// Štítok „SOLD“ v mierke karty na webe (mobil ~343 px → ×3,15): mono 11 px, verzálky, sivý text na bielom.
function soldBadge() {
  const s = W / 343;
  const font = 11 * s;
  const padX = 8 * s;
  const padY = 4 * s;
  const label = "SOLD";
  const w = Math.round(label.length * font * 0.66 + padX * 2);
  const h = Math.round(font * 1.4 + padY * 2);
  return {
    left: Math.round(12 * s),
    top: Math.round(12 * s),
    input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="JetBrains Mono, Menlo, monospace"
        font-size="${font}" letter-spacing="${font * 0.06}" fill="#9a9a9a">${label}</text>
    </svg>`),
  };
}

async function photo(file, target, overlays = []) {
  await sharp(path.join(media, file))
    .resize(W, H, { fit: "cover" })
    .composite(overlays)
    .jpeg({ quality: 90 })
    .toFile(path.join(out, target));
}

const withLogo = { input: logo, left: W - LOGO_W - MARGIN, top: H - logoH - MARGIN };

if (watch.status === "sold") {
  await photo(cover, "01.jpg", [soldBadge(), withLogo]);
} else {
  const files = [cover, ...watch.images.filter((f) => f !== cover)].slice(0, MAX_PHOTOS + 1);
  for (const [i, f] of files.entries()) {
    await photo(f, `${String(i + 1).padStart(2, "0")}.jpg`, i === 0 ? [withLogo] : []);
  }

  if (watch.video) {
    // Reel 9:16: záber 4:5 na stred, nad a pod ním rozmazaná kópia toho istého záberu.
    // Loop má ~5–7 s, preto za ním idú prvé fotky z galérie, spolu ~12–14 s. Bez zvuku, hudba sa pridá v Instagrame.
    const logoFile = path.join(out, ".logo.png");
    fs.writeFileSync(logoFile, logo);
    const photos = watch.images.slice(0, REEL_PHOTOS);
    const inputs = ["-i", path.join(media, watch.video)];
    for (const p of photos) inputs.push("-loop", "1", "-t", String(REEL_PHOTO_SECONDS), "-framerate", "30", "-i", path.join(media, p));
    inputs.push("-i", logoFile);
    const n = photos.length + 1;
    const top = (REEL_H - H) / 2;
    // Úvod v hornom rozmazanom páse: 0–2,5 s háčik z hook.txt (ak je), potom 3 s názov (značka, model, rok).
    // Veľa ľudí pozerá reels bez zvuku, háčik ich má zastaviť a názov povie, čo sú to za hodinky.
    const hookPath = path.join(out, "hook.txt");
    const hook = fs.existsSync(hookPath) ? fs.readFileSync(hookPath, "utf8").trim() : "";
    const name = `${watch.brand} ${watch.model.replace(/"/g, "")} · ${watch.year}`;
    const xml = (t) => t.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
    async function band(file, lines, size) {
      const gap = size * 1.2;
      const y0 = top * 0.58 - ((lines.length - 1) * gap) / 2;
      await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${top}">${lines
        .map((l, i) => `<text x="50%" y="${y0 + i * gap}" text-anchor="middle" dominant-baseline="central" font-family="Georgia, serif"
          font-size="${size}" fill="#ffffff" stroke="#000000" stroke-opacity="0.25" stroke-width="2" paint-order="stroke">${xml(l)}</text>`)
        .join("")}</svg>`)).png().toFile(file);
    }
    // Háčik zalomený na max. 2 riadky.
    const words = hook.split(" ");
    const half = Math.ceil(words.length / 2);
    const hookLines = hook.length > 30 ? [words.slice(0, half).join(" "), words.slice(half).join(" ")] : [hook];
    const titles = [];
    if (hook) titles.push({ file: path.join(out, ".hook.png"), lines: hookLines, size: 66, start: 0, dur: 2.5 });
    titles.push({ file: path.join(out, ".title.png"), lines: [name], size: 52, start: hook ? 2.5 : 0, dur: 3 });
    for (const t of titles) {
      await band(t.file, t.lines, t.size);
      inputs.push("-loop", "1", "-t", String(t.dur), "-framerate", "30", "-i", t.file);
    }
    let graph = "";
    for (let i = 0; i < n; i++) {
      graph +=
        `[${i}:v]split[a${i}][b${i}];` +
        `[a${i}]scale=${W}:${REEL_H}:force_original_aspect_ratio=increase,crop=${W}:${REEL_H},boxblur=40:4[bg${i}];` +
        `[b${i}]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}[fg${i}];` +
        `[bg${i}][fg${i}]overlay=0:${top},fps=30,setsar=1,format=yuv420p[s${i}];`;
    }
    graph += `${Array.from({ length: n }, (_, i) => `[s${i}]`).join("")}concat=n=${n}:v=1:a=0[v];`;
    graph += `[v][${n}:v]overlay=${W - LOGO_W - MARGIN}:${top + H - logoH - MARGIN}[t0];`;
    titles.forEach((t, i) => {
      graph +=
        `[${n + 1 + i}:v]format=rgba,fade=t=in:st=0:d=0.3:alpha=1,fade=t=out:st=${t.dur - 0.4}:d=0.4:alpha=1,setpts=PTS+${t.start}/TB[tt${i}];` +
        `[t${i}][tt${i}]overlay=0:0:eof_action=pass[t${i + 1}];`;
    });
    graph += `[t${titles.length}]format=yuv420p[out]`;
    execFileSync("ffmpeg", ["-y", "-v", "error", ...inputs, "-filter_complex", graph, "-map", "[out]",
      "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-movflags", "+faststart", path.join(out, "reel.mp4")]);
    fs.rmSync(logoFile);
    for (const t of titles) fs.rmSync(t.file);
  }
}

console.log(fs.readdirSync(out).join(" "));
