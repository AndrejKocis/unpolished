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
const LOGO_W = Math.round(W * 0.2);
const LOGO_OPACITY = 0.25; // vodoznak: väčší, ale polopriehľadný, nech neruší fotku
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

const logo = await logoPng(LOGO_W, LOGO_OPACITY);
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
    // cards.txt (scenár z ig-reel): riadky „začiatok trvanie text“, napr. „0 2.2 You've never heard a watch hum.“
    // Karty idú po sebe v bezpečnej zóne Instagramu (y 230–1440, vpravo 230 px voľných); video sa natiahne na ich dĺžku.
    const cardsPath = path.join(out, "cards.txt");
    // Riadok „style light“ v cards.txt = svetlé karty (papier #f4f4f4, čierny text) ako carousely a web; inak tmavé.
    const cardLines = fs.existsSync(cardsPath) ? fs.readFileSync(cardsPath, "utf8").trim().split("\n") : [];
    // Riadok „style elegant“ = texty bez rámčeka, na stred nad hodinkami, serif + kurzíva (časť za „|“), jemný tieň a prelnutia.
    // Riadok „ink dark“ = elegantné texty čiernym písmom so svetlým tieňom (na svetlé pozadie, napr. betón, papier).
    const isStyle = (l) => /^(style (light|elegant)|ink dark)$/.test(l.trim());
    const darkInk = cardLines.some((l) => l.trim() === "ink dark");
    const lightCards = cardLines.some((l) => l.trim() === "style light");
    const elegantCards = cardLines.some((l) => l.trim() === "style elegant");
    const cards = cardLines.length
      ? cardLines.filter((l) => !isStyle(l)).map((l) => {
          // Voliteľne „@y“ pred textom posunie kartu na výšku y (napr. „@1050“ nižšie na vodu, keď hore zakrýva záber).
          const [, start, dur, y, text] = l.match(/^([\d.]+)\s+([\d.]+)\s+(?:@(\d+)\s+)?(.+)$/);
          // „!“ na začiatku textu = zvýraznená follow karta (štítok FOLLOW FOR MORE, pod ním text, napr. @unpolished.watches).
          const accent = text.startsWith("!");
          return { start: Number(start), dur: Number(dur), y: y ? Number(y) : undefined, text: accent ? text.slice(1).trim() : text, accent };
        })
      : [];
    // clip.json: vlastný záber z terénu namiesto loopu a fotiek, napr.
    //   { "file": "/Users/andrej/Downloads/IMG_0176.MOV", "start": 3.5, "end": 14, "fps": 60, "zoom": 1.3, "cx": 0.48, "cy": 0.55 }
    // Úsek start–end v reálnej rýchlosti (speed < 1 spomalí), priblížený okolo cx/cy (podiel šírky/výšky), na celú plochu 9:16, bez vodoznaku.
    // "smooth": true = plynulé spomalenie (medzisnímky na 60 fps), pozri nižšie.
    // "warm": true dá záberu teplejší jesenný tón (viac oranžovej v stredných tónoch, jemne nižšia modrá).
    const clipPath = path.join(out, "clip.json");
    const clip = fs.existsSync(clipPath) ? JSON.parse(fs.readFileSync(clipPath, "utf8")) : null;
    const loopSec = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(media, watch.video)]));
    const cardsEnd = Math.max(0, ...cards.map((c) => c.start + c.dur));
    const photoSec = Math.max(REEL_PHOTO_SECONDS, Math.ceil(((cardsEnd - loopSec) / photos.length) * 10) / 10);
    const inputs = clip
      ? ["-ss", String(clip.start), "-t", String(clip.end - clip.start), "-i", clip.file]
      : ["-i", path.join(media, watch.video)];
    if (!clip) for (const p of photos) inputs.push("-loop", "1", "-t", String(photoSec), "-framerate", "30", "-i", path.join(media, p));
    inputs.push("-i", logoFile);
    const n = clip ? 1 : photos.length + 1;
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
    // Karta scenára: biely serif na tmavom polopriehľadnom podklade, zarovnaná vľavo, max. 2 riadky.
    const CARD_Y = 300;
    // Stred elegantných textov: mierne vľavo, aby text nezasahoval do pravého pásu s tlačidlami Instagramu (posledných 230 px).
    const ELEGANT_CX = 470;
    // Elegantné texty začínajú vyššie (bezpečná zóna je od y 230), aby mali vzduch nad hodinkami.
    const ELEGANT_Y = 240;
    async function elegantCard(file, text, accent) {
      const [main, italic] = text.split("|").map((t) => t.trim());
      const size = 56;
      const shadow = `<defs><filter id="s" x="-20%" y="-50%" width="140%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="${darkInk ? "#fff" : "#000"}" flood-opacity="${darkInk ? 0.4 : 0.55}"/></filter></defs>`;
      const t = (y, body, attrs) => `<text x="${ELEGANT_CX}" y="${y}" text-anchor="middle" filter="url(#s)" ${attrs}>${xml(body)}</text>`;
      let g = "";
      let y = 24;
      if (accent) {
        g += t((y += 40), "FOLLOW FOR MORE", `font-family="Menlo, monospace" font-weight="bold" font-size="40" letter-spacing="6" fill="${darkInk ? "#b3261e" : "#f0574a"}"`);
        y += 34;
      }
      g += t((y += size), main, `font-family="Georgia, serif" font-size="${size}" fill="${darkInk ? "#111111" : "#ffffff"}"`);
      if (italic) g += t((y += size * 1.2), italic, `font-family="Georgia, serif" font-style="italic" font-size="${size}" fill="${darkInk ? "#111111" : "#ffffff"}" fill-opacity="0.92"`);
      await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Math.round(y + 40)}">${shadow}${g}</svg>`)).png().toFile(file);
    }
    async function card(file, text, accent = false) {
      if (elegantCards) return elegantCard(file, text, accent);
      // Zvýraznená výzva ako follow slajd v carouseloch: papier, červený mono štítok FOLLOW FOR MORE, pod ním text (handle).
      if (accent) {
        const label = 64 * 0.62;
        const w = Math.round(Math.max(text.length * 64 * 0.5, 15 * label * 0.68) + 72);
        const h = Math.round(label + 64 * 1.18 + 76);
        await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}">
          <rect x="60" y="0" width="${w}" height="${h}" fill="#f4f4f4" fill-opacity="0.96"/>
          <rect x="60" y="0" width="8" height="${h}" fill="#b3261e"/>
          <text x="96" y="${24 + label}" font-family="Menlo, monospace" font-size="${label}" letter-spacing="5" fill="#b3261e">FOLLOW FOR MORE</text>
          <text x="96" y="${36 + label + 64}" font-family="Georgia, serif" font-size="64" fill="#111111">${xml(text)}</text></svg>`)).png().toFile(file);
        return;
      }
      const lines = [];
      for (const word of text.split(" ")) {
        const last = lines.at(-1);
        if (last && (last + " " + word).length <= 20) lines[lines.length - 1] = `${last} ${word}`;
        else lines.push(word);
      }
      const size = 64;
      const gap = size * 1.18;
      const h = Math.round(lines.length * gap + 56);
      const w = Math.round(Math.max(...lines.map((l) => l.length)) * size * 0.5 + 72);
      await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}">
        <rect x="60" y="0" width="${w}" height="${h}" rx="${lightCards ? 0 : 6}" fill="${lightCards ? "#f4f4f4" : "#000000"}" fill-opacity="${lightCards ? 0.94 : 0.45}"/>${lines
          .map((l, i) => `<text x="96" y="${28 + size * 0.85 + i * gap}" font-family="Georgia, serif" font-size="${size}" fill="${lightCards ? "#111111" : "#ffffff"}">${xml(l)}</text>`)
          .join("")}</svg>`)).png().toFile(file);
    }
    const titles = [];
    if (cards.length) {
      for (const [i, c] of cards.entries()) titles.push({ file: path.join(out, `.card${i}.png`), text: c.text, accent: c.accent, start: c.start, dur: c.dur, y: c.y ?? (elegantCards ? ELEGANT_Y : CARD_Y) });
    } else {
      if (hook) titles.push({ file: path.join(out, ".hook.png"), lines: hookLines, size: 66, start: 0, dur: 2.5, y: 0 });
      titles.push({ file: path.join(out, ".title.png"), lines: [name], size: 52, start: hook ? 2.5 : 0, dur: 3, y: 0 });
    }
    for (const t of titles) {
      if (t.text) await card(t.file, t.text, t.accent);
      else await band(t.file, t.lines, t.size);
      inputs.push("-loop", "1", "-t", String(t.dur), "-framerate", "30", "-i", t.file);
    }
    let graph = "";
    // iPhone točí HDR (HLG, BT.2020). Bez prevodu by reel v SDR vyzeral vyblednutý; LUT (scripts/instagram/hlg-lut.mjs)
    // prevedie farby ako Apple, ale na rozdiel od avconvert ponechá 60 fps.
    let hdrToSdr = "";
    if (clip) {
      const trc = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=color_transfer", "-of", "default=nw=1:nk=1", clip.file]).toString().trim();
      if (trc === "arib-std-b67") {
        const cube = path.join(out, ".hlg.cube");
        execFileSync("node", [path.join(ROOT, "scripts/instagram/hlg-lut.mjs"), cube, String(clip.exposure ?? 0.45)]);
        hdrToSdr = `scale=in_color_matrix=bt2020:in_range=tv,format=gbrpf32le,lut3d=file=${cube},scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,`;
      }
    }
    if (clip) {
      const z = clip.zoom ?? 1;
      graph +=
        `[0:v]setpts=PTS/${clip.speed ?? 1},` +
        `crop=w=iw/${z}:h=ih/${z}:x=min(max(0\\,iw*${clip.cx ?? 0.5}-iw/${z}/2)\\,iw-iw/${z}):y=min(max(0\\,ih*${clip.cy ?? 0.5}-ih/${z}/2)\\,ih-ih/${z}),` +
        // "smooth": true dopočíta medzisnímky na 60 fps (pri spomalení, ktoré nedelí 60 fps záber bezo zvyšku, napr. 0,7×,
        // by inak fps= vyhadzovalo snímky nerovnomerne a pohyb by trhal).
        `scale=${W}:${REEL_H},${hdrToSdr}` +
        // "push": { "from": 4, "zoom": 1.08 } = od času from (s, vo výslednom videu) pomaly priblíži až na zoom do konca klipu,
        // aby dlhý statický záber nestál.
        (clip.push
          ? (() => {
              // zoompan na 2× zväčšenom obraze, aby priblíženie neposkakovalo po celých pixeloch.
              const rate = (60 * (clip.speed ?? 1)).toFixed(3);
              const k = (clip.push.zoom - 1) / ((clip.end - clip.start) / (clip.speed ?? 1) - clip.push.from);
              return `fps=${rate},scale=${W * 2}:${REEL_H * 2},zoompan=z='1+${k}*max(0\\,it-${clip.push.from})':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=${W}x${REEL_H}:fps=${rate},`;
            })()
          : "") +
        `${clip.smooth ? "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" : `fps=${clip.fps ?? 30}`},setsar=1,` +
        (clip.warm ? `colorbalance=rm=0.08:gm=0.02:bm=-0.08:rh=0.04:bh=-0.05,eq=saturation=1.08,` : "") +
        `format=yuv420p[v];`;
    } else for (let i = 0; i < n; i++) {
      graph +=
        `[${i}:v]split[a${i}][b${i}];` +
        `[a${i}]scale=${W}:${REEL_H}:force_original_aspect_ratio=increase,crop=${W}:${REEL_H},boxblur=40:4[bg${i}];` +
        `[b${i}]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}[fg${i}];` +
        `[bg${i}][fg${i}]overlay=0:${top},fps=30,setsar=1,format=yuv420p[s${i}];`;
    }
    if (!clip) graph += `${Array.from({ length: n }, (_, i) => `[s${i}]`).join("")}concat=n=${n}:v=1:a=0[v];`;
    // Vodoznak len pri reeli z loopu a fotiek; záber z terénu (clip.json) ide bez neho.
    graph += clip ? `[v]null[t0];` : `[v][${n}:v]overlay=${W - LOGO_W - MARGIN}:${top + H - logoH - MARGIN}[t0];`;
    titles.forEach((t, i) => {
      graph +=
        // Prvá karta (háčik) je viditeľná hneď od prvého snímku, ostatné sa jemne objavia.
        // Elegantné texty sa vždy prelínajú 0,3 s dnu aj von.
        `[${n + 1 + i}:v]format=rgba,${elegantCards ? "fade=t=in:st=0:d=0.3:alpha=1," : t.start > 0 ? "fade=t=in:st=0:d=0.2:alpha=1," : ""}fade=t=out:st=${t.dur - (elegantCards ? 0.3 : 0.25)}:d=${elegantCards ? 0.3 : 0.25}:alpha=1,setpts=PTS+${t.start}/TB[tt${i}];` +
        `[t${i}][tt${i}]overlay=0:${t.y}:eof_action=pass[t${i + 1}];`;
    });
    graph += `[t${titles.length}]format=yuv420p[out]`;
    execFileSync("ffmpeg", ["-y", "-v", "error", ...inputs, "-filter_complex", graph, "-map", "[out]",
      "-an", "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
      // značky aj priamo do H.264 streamu, inak ich ffmpeg pri výstupe z filtrov niekedy nezapíše
      "-bsf:v", "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1",
      "-movflags", "+faststart", path.join(out, "reel.mp4")]);
    fs.rmSync(logoFile);
    fs.rmSync(path.join(out, ".hlg.cube"), { force: true });
    for (const t of titles) fs.rmSync(t.file);
  }
}

console.log(fs.readdirSync(out).join(" "));
